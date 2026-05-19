import { query } from '../config/db.js';
import { StatusCodes } from 'http-status-codes';
import NotFoundError from '../errors/NotFoundError.js';
import InternalServerError from '../errors/InternalServerError.js';
import ConflictError from '../errors/ConflictError.js';

const ingredientFields = 'id, name, status, created_by_user_id';

// Helper function to create consistent responses for ingredient conflicts
const sendIngredientConflict = (res, ingredient) =>
  res.status(StatusCodes.CONFLICT).json({
    message: 'Ingredient already exists',
    ingredient,
  });

// Helper function to check for global or user-owned ingredients
const findVisibleIngredientByName = async (name, userId, excludedId = null) => {
  const values = [name, userId];
  let excludedIdFilter = '';

  // Make sure to not edit the current ingredient if given one
  if (excludedId !== null) {
    values.push(excludedId);
    excludedIdFilter = `AND id <> $${values.length}`;
  }

  const result = await query(
    `
    SELECT ${ingredientFields}
    FROM ingredients
    WHERE name = $1 AND (created_by_user_id IS NULL OR created_by_user_id = $2) ${excludedIdFilter}
    LIMIT 1
    `,
    values
  );

  return result.rows[0];
};

export const createIngredient = async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;

    // Prevent duplicate global or user-owned ingredients
    const existingIngredient = await findVisibleIngredientByName(name, userId);
    if (existingIngredient) {
      return sendIngredientConflict(res, existingIngredient);
    }

    const result = await query(
      `
      INSERT INTO ingredients (name, created_by_user_id)
      VALUES ($1, $2)
      RETURNING ${ingredientFields}
      `,
      [name, userId]
    );

    const ingredient = result.rows[0];

    return res.status(StatusCodes.CREATED).json({ ingredient });
  } catch (error) {
    if (error.code === '23505') {
      const existingIngredient = await findVisibleIngredientByName(
        req.body.name,
        req.user.userId
      );

      if (existingIngredient) {
        return sendIngredientConflict(res, existingIngredient);
      }

      return next(new ConflictError('Ingredient already exists'));
    }

    return next(new InternalServerError('Unable to create ingredient'));
  }
};

export const getIngredients = async (req, res, next) => {
  try {
    const search = req.query.search;
    const userId = req.user.userId;

    if (search) {
      // Casts 'name' column into text before using the ILIKE comparison (insensitive word check)
      const result = await query(
        `
        SELECT id, name, status, created_by_user_id
        FROM ingredients
        WHERE status = 'active' AND name::text ILIKE '%' || $1 || '%' AND (created_by_user_id IS NULL OR created_by_user_id = $2)
        ORDER BY name
        `,
        [search, userId]
      );

      return res.status(StatusCodes.OK).json({ ingredients: result.rows });
    }

    const result = await query(
      `
      SELECT id, name, status, created_by_user_id
      FROM ingredients
      WHERE status = 'active' AND (created_by_user_id IS NULL OR created_by_user_id = $1)
      ORDER BY name
      `,
      [userId]
    );

    return res.status(StatusCodes.OK).json({ ingredients: result.rows });
  } catch (_error) {
    return next(new InternalServerError('Unable to fetch ingredients'));
  }
};

export const getSingleIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await query(
      `
      SELECT id, name, status, created_by_user_id
      FROM ingredients
      WHERE id = $1 AND status = 'active' AND (created_by_user_id IS NULL OR created_by_user_id = $2)
      `,
      [id, userId]
    );

    const ingredient = result.rows[0];
    if (!ingredient) {
      throw new NotFoundError('Ingredient not found');
    }

    return res.status(StatusCodes.OK).json({ ingredient });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to fetch ingredient'));
  }
};

export const updateIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.userId;

    // Only user-owned active ingredients can be updated
    const currentIngredientResult = await query(
      `
      SELECT id
      FROM ingredients
      WHERE id = $1 AND status = 'active' AND created_by_user_id = $2
      `,
      [id, userId]
    );

    if (!currentIngredientResult.rows[0]) {
      throw new NotFoundError('Ingredient not found');
    }

    // Prevent renaming into a duplicate global or user-owned ingredient
    const existingIngredient = await findVisibleIngredientByName(
      name,
      userId,
      id
    );

    if (existingIngredient) {
      return sendIngredientConflict(res, existingIngredient);
    }

    const result = await query(
      `
      UPDATE ingredients
      SET name = $1
      WHERE id = $2 AND status = 'active' AND created_by_user_id = $3
      RETURNING ${ingredientFields}
      `,
      [name, id, userId]
    );

    const ingredient = result.rows[0];
    if (!ingredient) {
      throw new NotFoundError('Ingredient not found');
    }

    return res.status(StatusCodes.OK).json({ ingredient });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    if (error.code === '23505') {
      const existingIngredient = await findVisibleIngredientByName(
        req.body.name,
        req.user.userId,
        req.params.id
      );

      if (existingIngredient) {
        return sendIngredientConflict(res, existingIngredient);
      }

      return next(new ConflictError('Ingredient already exists'));
    }

    return next(new InternalServerError('Unable to update ingredient'));
  }
};

export const hideIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Soft delete only user-owned active ingredients
    const result = await query(
      `
        UPDATE ingredients
        SET status = 'hidden'
        WHERE id = $1 AND status = 'active' AND created_by_user_id = $2
        RETURNING id, name, status, created_by_user_id
        `,
      [id, userId]
    );

    const ingredient = result.rows[0];
    if (!ingredient) {
      throw new NotFoundError('Ingredient not found');
    }

    return res.status(StatusCodes.OK).json({ ingredient });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to delete ingredient'));
  }
};

export const reactivateIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Only hidden user-owned ingredients can be reactivated
    const hiddenIngredientResult = await query(
      `
      SELECT id, name
      FROM ingredients
      WHERE id = $1 AND status = 'hidden' AND created_by_user_id = $2
      `,
      [id, userId]
    );

    const hiddenIngredient = hiddenIngredientResult.rows[0];
    if (!hiddenIngredient) {
      throw new NotFoundError('Ingredient not found');
    }

    // Prevent reactivating into a duplicate active ingredient
    const existingIngredientResult = await query(
      `
      SELECT ${ingredientFields}
      FROM ingredients
      WHERE name = $1
        AND id <> $2
        AND status = 'active'
        AND (created_by_user_id IS NULL OR created_by_user_id = $3)
      LIMIT 1
      `,
      [hiddenIngredient.name, id, userId]
    );

    const existingIngredient = existingIngredientResult.rows[0];
    if (existingIngredient) {
      return sendIngredientConflict(res, existingIngredient);
    }

    const result = await query(
      `
        UPDATE ingredients
        SET status = 'active'
        WHERE id = $1 AND status = 'hidden' AND created_by_user_id = $2
        RETURNING id, name, status, created_by_user_id
        `,
      [id, userId]
    );

    const ingredient = result.rows[0];
    if (!ingredient) {
      throw new NotFoundError('Ingredient not found');
    }

    return res.status(StatusCodes.OK).json({ ingredient });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to recover ingredient'));
  }
};
