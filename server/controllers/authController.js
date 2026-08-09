import crypto from 'node:crypto';
import { query, getClient } from '../config/db.js';
import { StatusCodes } from 'http-status-codes';
import { hashPassword, comparePasswords } from '../utils/password.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import {
  destroyLibraryCover,
  destroyRecipeImage,
} from '../config/cloudinary.js';
import UnauthorizedError from '../errors/UnauthorizedError.js';
import NotFoundError from '../errors/NotFoundError.js';
import InternalServerError from '../errors/InternalServerError.js';
import ConflictError from '../errors/ConflictError.js';
import BadRequestError from '../errors/BadRequestError.js';
import { buildUpdatedFields } from '../utils/buildUpdatedFields.js';
import { logError, logSecurityEvent } from '../utils/logger.js';

const authDBAttributes = ['name', 'email'];

const createResetToken = () => crypto.randomBytes(32).toString('hex');

const hashResetToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const clearAuthCookie = (res) => {
  res.clearCookie('sid', {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
};

const deleteUserSessions = (client, userId) =>
  client.query(
    `
      DELETE FROM user_sessions
      WHERE sess ->> 'userId' = $1
    `,
    [String(userId)]
  );

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await hashPassword(password);

    const result = await query(
      `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email
      `,
      [name, email, hashedPassword]
    );

    const user = result.rows[0];

    req.session.regenerate((error) => {
      if (error) {
        return next(new InternalServerError('Unable to start session'));
      }

      req.session.userId = user.id;

      return res.status(StatusCodes.CREATED).json({
        data: { user },
      });
    });
  } catch (error) {
    if (error.code === '23505') {
      return next(new ConflictError('Email already registered'));
    }

    return next(new InternalServerError('Unable to register user'));
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      `
      SELECT id, name, email, password_hash
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      logSecurityEvent('security.login_failed', req);
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await comparePasswords(password, user.password_hash);
    if (!isMatch) {
      logSecurityEvent('security.login_failed', req);
      throw new UnauthorizedError('Invalid credentials');
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    req.session.regenerate((error) => {
      if (error) {
        return next(new InternalServerError('Unable to start session'));
      }

      req.session.userId = safeUser.id;

      return res.status(StatusCodes.OK).json({
        data: { user: safeUser },
      });
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to log in user'));
  }
};

export const logout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next(new InternalServerError('Unable to log out user'));
    }

    clearAuthCookie(res);

    return res.status(StatusCodes.OK).json({
      message: 'Logged out successfully',
    });
  });
};

export const updateUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { updatedFields, updatedValues } = buildUpdatedFields(
      req.body,
      authDBAttributes
    );

    updatedValues.push(userId);

    const result = await query(
      `
      UPDATE users
      SET ${updatedFields.join(', ')}
      WHERE id = $${updatedValues.length}
      RETURNING id, name, email
      `,
      updatedValues
    );

    const user = result.rows[0];
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return res.status(StatusCodes.OK).json({ data: { user } });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    if (error.code === '23505') {
      return next(new ConflictError('Email already registered'));
    }

    return next(new InternalServerError('Unable to update user'));
  }
};

export const deleteUser = async (req, res, next) => {
  let client;

  try {
    const userId = req.user.userId;
    const { currentPassword } = req.body;

    client = await getClient();
    await client.query('BEGIN');

    const userResult = await client.query(
      `
        SELECT id, password_hash
        FROM users
        WHERE id = $1
        FOR UPDATE
      `,
      [userId]
    );

    const user = userResult.rows[0];
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const passwordMatch = await comparePasswords(
      currentPassword,
      user.password_hash
    );

    if (!passwordMatch) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const imageResult = await client.query(
      `
        SELECT image_public_id AS public_id, 'recipe' AS asset_type
        FROM recipes
        WHERE created_by_user_id = $1
          AND image_public_id IS NOT NULL
        UNION ALL
        SELECT cover_image_public_id AS public_id, 'library' AS asset_type
        FROM libraries
        WHERE user_id = $1
          AND cover_image_public_id IS NOT NULL
      `,
      [userId]
    );

    for (const image of imageResult.rows) {
      if (image.asset_type === 'recipe') {
        await destroyRecipeImage(image.public_id);
      } else {
        await destroyLibraryCover(image.public_id);
      }
    }

    await deleteUserSessions(client, userId);

    const result = await client.query(
      `
      DELETE FROM users
      WHERE id = $1
      RETURNING id, name, email
      `,
      [userId]
    );

    const deletedUser = result.rows[0];
    if (!deletedUser) {
      throw new NotFoundError('User not found');
    }

    await client.query('COMMIT');
    clearAuthCookie(res);

    return res.status(StatusCodes.OK).json({
      message: 'Account deleted successfully',
    });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }

    if (error instanceof NotFoundError) {
      return next(error);
    }

    if (error instanceof UnauthorizedError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to delete user'));
  } finally {
    if (client) {
      client.release();
    }
  }
};

export const updatePassword = async (req, res, next) => {
  let client;

  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    client = await getClient();
    await client.query('BEGIN');

    const result = await client.query(
      `
      SELECT id, password_hash
      FROM users
      WHERE id = $1
      FOR UPDATE
      `,
      [userId]
    );

    const user = result.rows[0];
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const passwordMatch = await comparePasswords(
      currentPassword,
      user.password_hash
    );

    if (!passwordMatch) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const newPasswordMatchesCurrent = await comparePasswords(
      newPassword,
      user.password_hash
    );

    if (newPasswordMatchesCurrent) {
      throw new BadRequestError(
        'Your new password must be different from your current password'
      );
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await client.query(
      `
      UPDATE users
      SET password_hash = $1
      WHERE id = $2
      `,
      [hashedNewPassword, userId]
    );

    await deleteUserSessions(client, userId);
    await client.query('COMMIT');
    clearAuthCookie(res);

    return res.status(StatusCodes.OK).json({
      message: 'Password updated. Please sign in again.',
    });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }

    if (
      error instanceof NotFoundError ||
      error instanceof UnauthorizedError ||
      error instanceof BadRequestError
    ) {
      return next(error);
    }

    return next(new InternalServerError('Unable to update password'));
  } finally {
    if (client) {
      client.release();
    }
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const result = await query(
      `
      SELECT id, email
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(StatusCodes.OK).json({
        message:
          'If an account exists for that email, a password reset link has been sent.',
      });
    }

    const resetToken = createResetToken();
    const hashedResetToken = hashResetToken(resetToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await query(
      `
      INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      `,
      [user.id, hashedResetToken, expiresAt]
    );

    const resetUrl = new URL('/reset-password', process.env.CLIENT_URL);
    resetUrl.searchParams.set('token', resetToken);

    try {
      await sendPasswordResetEmail({
        to: user.email,
        resetUrl: resetUrl.toString(),
      });
    } catch (error) {
      logError('auth.password_reset_email_failed', {
        requestId: req.requestId,
        errorName: error instanceof Error ? error.name : 'UnknownError',
        errorMessage:
          error instanceof Error ? error.message : 'Unknown email error',
      });
    }

    return res.status(StatusCodes.OK).json({
      message:
        'If an account exists for that email, a password reset link has been sent.',
    });
  } catch (_error) {
    return next(new InternalServerError('Unable to send password reset email'));
  }
};

export const resetPassword = async (req, res, next) => {
  let client;

  try {
    const { token, newPassword } = req.body;
    const hashedToken = hashResetToken(token);
    const hashedPassword = await hashPassword(newPassword);

    client = await getClient();
    await client.query('BEGIN');

    const resetTokenResult = await client.query(
      `
      SELECT reset_token.id, reset_token.user_id, users.password_hash
      FROM password_reset_tokens AS reset_token
      JOIN users ON users.id = reset_token.user_id
      WHERE reset_token.token_hash = $1
        AND reset_token.used_at IS NULL
        AND reset_token.expires_at > NOW()
      LIMIT 1
      FOR UPDATE
      `,
      [hashedToken]
    );

    const resetToken = resetTokenResult.rows[0];

    if (!resetToken) {
      throw new BadRequestError(
        'Password reset link is invalid or has expired'
      );
    }

    const newPasswordMatchesCurrent = await comparePasswords(
      newPassword,
      resetToken.password_hash
    );

    if (newPasswordMatchesCurrent) {
      throw new BadRequestError(
        'Your new password must be different from your current password'
      );
    }

    await client.query(
      `
      UPDATE users
      SET password_hash = $1
      WHERE id = $2
      `,
      [hashedPassword, resetToken.user_id]
    );

    await client.query(
      `
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE user_id = $1
        AND used_at IS NULL
      `,
      [resetToken.user_id]
    );

    await deleteUserSessions(client, resetToken.user_id);

    await client.query('COMMIT');

    return res.status(StatusCodes.OK).json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }

    if (error instanceof BadRequestError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to reset password'));
  } finally {
    if (client) {
      client.release();
    }
  }
};

export const getUser = async (req, res, next) => {
  try {
    const result = await query(
      `
      SELECT id, name, email
      FROM users
      WHERE id = $1
      `,
      [req.user.userId]
    );

    const user = result.rows[0];
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return res.status(StatusCodes.OK).json({ data: { user } });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to fetch user'));
  }
};
