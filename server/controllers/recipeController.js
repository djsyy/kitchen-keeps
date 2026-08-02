import { query } from '../config/db.js';
import { StatusCodes } from 'http-status-codes';
import NotFoundError from '../errors/NotFoundError.js';
import InternalServerError from '../errors/InternalServerError.js';
import ConflictError from '../errors/ConflictError.js';
import { buildUpdatedFields } from '../utils/buildUpdatedFields.js';

const recipeDBAttributes = [
  'title',
  'description',
  'image_url',
  'prep_time_minutes',
  'cook_time_minutes',
  'servings',
];

export const createRecipe = async (req, res, next) => {
  try {
    const {
      title,
      description,
      image_url,
      prep_time_minutes,
      cook_time_minutes,
      servings,
    } = req.body;
    const userId = req.user.userId;

    const result = await query(
      `
      INSERT INTO recipes (title, description, image_url, created_by_user_id, prep_time_minutes, cook_time_minutes, servings)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, title, description, image_url, created_by_user_id, prep_time_minutes, cook_time_minutes, servings, created_at, updated_at
      `,
      [
        title,
        description ?? null,
        image_url ?? null,
        userId,
        prep_time_minutes ?? null,
        cook_time_minutes ?? null,
        servings ?? null,
      ]
    );

    const recipe = result.rows[0];

    return res.status(StatusCodes.CREATED).json({ data: { recipe } });
  } catch (error) {
    if (error.code === '23505') {
      return next(new ConflictError('Recipe title already exists'));
    }

    return next(new InternalServerError('Unable to create recipe'));
  }
};

export const getRecipes = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `
      SELECT id, title, description, image_url, created_by_user_id, prep_time_minutes, cook_time_minutes, servings, created_at, updated_at
      FROM recipes
      WHERE created_by_user_id = $1
      ORDER BY title
      `,
      [userId]
    );

    return res.status(StatusCodes.OK).json({
      data: { recipes: result.rows },
      meta: { count: result.rows.length },
    });
  } catch (_error) {
    return next(new InternalServerError('Unable to fetch recipes'));
  }
};

export const getSingleRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await query(
      `
      SELECT id, title, description, image_url, created_by_user_id, prep_time_minutes, cook_time_minutes, servings, created_at, updated_at
      FROM recipes
      WHERE created_by_user_id = $1 AND id = $2
      `,
      [userId, id]
    );

    const recipe = result.rows[0];
    if (!recipe) {
      throw new NotFoundError('Recipe not found');
    }

    return res.status(StatusCodes.OK).json({ data: { recipe } });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to fetch recipe'));
  }
};

export const updateRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { updatedFields, updatedValues } = buildUpdatedFields(
      req.body,
      recipeDBAttributes
    );

    updatedValues.push(userId);
    updatedValues.push(id);

    const result = await query(
      `
      UPDATE recipes
      SET ${updatedFields.join(', ')}
      WHERE created_by_user_id = $${updatedValues.length - 1} AND id = $${updatedValues.length}
      RETURNING id, title, description, image_url, created_by_user_id, prep_time_minutes, cook_time_minutes, servings, created_at, updated_at
      `,
      updatedValues
    );

    const recipe = result.rows[0];
    if (!recipe) {
      throw new NotFoundError('Recipe not found');
    }

    return res.status(StatusCodes.OK).json({ data: { recipe } });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    if (error.code === '23505') {
      return next(new ConflictError('Recipe title already exists'));
    }

    return next(new InternalServerError('Unable to update recipe'));
  }
};

export const deleteRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await query(
      `
      DELETE from recipes
      WHERE created_by_user_id = $1 AND id = $2
      RETURNING id, title, description, image_url, created_by_user_id, prep_time_minutes, cook_time_minutes, servings, created_at, updated_at
      `,
      [userId, id]
    );

    const recipe = result.rows[0];
    if (!recipe) {
      throw new NotFoundError('Recipe not found');
    }

    return res.status(StatusCodes.OK).json({ data: { recipe } });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to delete recipe'));
  }
};
