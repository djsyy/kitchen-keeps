import { query } from '../config/db.js';
import { StatusCodes } from 'http-status-codes';
import NotFoundError from '../errors/NotFoundError.js';
import InternalServerError from '../errors/InternalServerError.js';
import ConflictError from '../errors/ConflictError.js';

export const createLibrary = async (req, res, next) => {
  try {
    const { name, description, icon_key: iconKey = 'folder' } = req.body;
    const userId = req.user.userId;
    const normalizedDescription = description ?? null;

    const result = await query(
      `
      INSERT INTO libraries (user_id, name, description, icon_key)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, name, description, icon_key, created_at
      `,
      [userId, name, normalizedDescription, iconKey]
    );

    const library = result.rows[0];

    return res.status(StatusCodes.CREATED).json({ data: { library } });
  } catch (error) {
    if (error.code === '23505') {
      return next(new ConflictError('Library name already exists'));
    }

    return next(new InternalServerError('Unable to create library'));
  }
};

export const getLibraries = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `
      SELECT * from libraries
      WHERE user_id = $1
      ORDER BY name
      `,
      [userId]
    );

    return res.status(StatusCodes.OK).json({
      data: { libraries: result.rows },
      meta: { count: result.rows.length },
    });
  } catch (_error) {
    return next(new InternalServerError('Unable to fetch libraries'));
  }
};

export const getSingleLibrary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await query(
      `
      SELECT * from libraries
      WHERE user_id = $1 AND id = $2
      `,
      [userId, id]
    );

    const library = result.rows[0];
    if (!library) {
      throw new NotFoundError('Library not found');
    }

    return res.status(StatusCodes.OK).json({ data: { library } });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to fetch library'));
  }
};

export const updateLibrary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const updatedFields = [];
    const updatedValues = [];

    if (Object.hasOwn(req.body, 'name')) {
      updatedValues.push(req.body.name);
      updatedFields.push(`name = $${updatedValues.length}`);
    }

    if (Object.hasOwn(req.body, 'description')) {
      updatedValues.push(req.body.description);
      updatedFields.push(`description = $${updatedValues.length}`);
    }

    if (Object.hasOwn(req.body, 'icon_key')) {
      updatedValues.push(req.body.icon_key);
      updatedFields.push(`icon_key = $${updatedValues.length}`);
    }

    updatedValues.push(userId);
    updatedValues.push(id);

    const result = await query(
      `
      UPDATE libraries
      SET ${updatedFields.join(', ')}
      WHERE user_id = $${updatedValues.length - 1} AND id = $${updatedValues.length}
      RETURNING name, description, icon_key, user_id, id, created_at
      `,
      updatedValues
    );

    const library = result.rows[0];
    if (!library) {
      throw new NotFoundError('Library not found');
    }

    return res.status(StatusCodes.OK).json({ data: { library } });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    if (error.code === '23505') {
      return next(new ConflictError('Library name already exists'));
    }

    return next(new InternalServerError('Unable to update library'));
  }
};

export const deleteLibrary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await query(
      `
      DELETE from libraries
      WHERE user_id = $1 AND id = $2
      RETURNING id, user_id, name, description, icon_key, created_at
      `,
      [userId, id]
    );

    const library = result.rows[0];
    if (!library) {
      throw new NotFoundError('Library not found');
    }

    return res.status(StatusCodes.OK).json({ data: { library } });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to delete library'));
  }
};
