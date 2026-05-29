import { query } from '../config/db.js';
import { StatusCodes } from 'http-status-codes';
import { hashPassword, comparePasswords } from '../utils/password.js';
import { createJWT } from '../utils/token.js';
import UnauthorizedError from '../errors/UnauthorizedError.js';
import NotFoundError from '../errors/NotFoundError.js';
import InternalServerError from '../errors/InternalServerError.js';
import ConflictError from '../errors/ConflictError.js';

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
    const token = createJWT({ userId: user.id, name: user.name });

    return res.status(StatusCodes.CREATED).json({ data: { user, token } });
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
    const token = createJWT({ userId: user.id, name: user.name });
    return res.status(StatusCodes.OK).json({
      data: { user: safeUser, token },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to log in user'));
  }
};

// Returns the current user
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
