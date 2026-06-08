import { query } from '../config/db.js';
import { StatusCodes } from 'http-status-codes';
import { hashPassword, comparePasswords } from '../utils/password.js';
import UnauthorizedError from '../errors/UnauthorizedError.js';
import NotFoundError from '../errors/NotFoundError.js';
import InternalServerError from '../errors/InternalServerError.js';
import ConflictError from '../errors/ConflictError.js';

const authDBAttributes = ['name', 'email'];

// Helper function to parse and keep optional values that have been set
const buildUpdatedProfileFields = (req) => {
  const updatedValues = [];
  const updatedFields = [];

  authDBAttributes.forEach((attribute) => {
    if (Object.hasOwn(req.body, attribute)) {
      updatedValues.push(req.body[attribute]);
      updatedFields.push(`${attribute} = $${updatedValues.length}`);
    }
  });

  return { updatedValues, updatedFields };
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, _confirmPassword } = req.body;
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
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await comparePasswords(password, user.password_hash);
    if (!isMatch) {
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

    res.clearCookie('sid', {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.status(StatusCodes.OK).json({
      message: 'Logged out successfully',
    });
  });
};

export const updateUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { updatedFields, updatedValues } = buildUpdatedProfileFields(req);

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

export const updatePassword = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword, _confirmNewPassword } = req.body;

    const result = await query(
      `
      SELECT id, password_hash
      FROM users
      WHERE id = $1
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
      throw new UnauthorizedError('Invalid credentials');
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await query(
      `
      UPDATE users
      SET password_hash = $1
      WHERE id = $2
      `,
      [hashedNewPassword, userId]
    );

    return res.status(StatusCodes.OK).json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to update password'));
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
