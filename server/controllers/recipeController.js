import { query } from '../config/db.js';
import { StatusCodes } from 'http-status-codes';
import NotFoundError from '../errors/NotFoundError.js';
import InternalServerError from '../errors/InternalServerError.js';
import ConflictError from '../errors/ConflictError.js';

const recipeDBAttributes = [
  'title',
  'description',
  'image_url',
  'prep_time_minutes',
  'cook_time_minutes',
  'servings',
];

// Helper function to parse and keep optional values that have been set
const buildUpdatedRecipeFields = (req) => {
  const updatedValues = [];
  const updatedFields = [];

  recipeDBAttributes.forEach((attribute) => {
    if (Object.hasOwn(req.body, attribute)) {
      updatedValues.push(req.body[attribute]);
      updatedFields.push(`${attribute} = $${updatedValues.length}`);
    }
  });

  return { updatedValues, updatedFields };
};

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
      RETURNING id, title, description, image_url, userId, prep_time_minutes, cook_time_minutes, servings
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

    return res.status(StatusCodes.CREATED).json({ recipe });
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
      SELECT title, description, image_url, created_by_user_id, prep_time_minutes, cook_time_minutes, servings from recipes
      WHERE user_id = $1
      ORDER BY name
      `,
      [userId]
    );

    return res.status(StatusCodes.OK).json({ recipes: result.rows });
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
      SELECT * from libraries
      WHERE user_id = $1 AND id = $2
      `,
      [userId, id]
    );

    const library = result.rows[0];
    if (!library) {
      throw new NotFoundError('Library not found');
    }

    return res.status(StatusCodes.OK).json({ library });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to fetch library'));
  }
};

export const updateRecipe = async (req, res, next) => {
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

    updatedValues.push(userId);
    updatedValues.push(id);

    const result = await query(
      `
      UPDATE libraries
      SET ${updatedFields.join(', ')}
      WHERE user_id = $${updatedValues.length - 1} AND id = $${updatedValues.length}
      RETURNING name, description, user_id, id
      `,
      updatedValues
    );

    const library = result.rows[0];
    if (!library) {
      throw new NotFoundError('Library not found');
    }

    return res.status(StatusCodes.OK).json({ library });
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

export const deleteRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await query(
      `
      DELETE from recipes
      WHERE created_by_user_id = $1 AND id = $2
      RETURNING id, title, description, image_url, created_by_user_id, prep_time_minutes, cook_time_minutes, servings
      `,
      [userId, id]
    );

    const recipe = result.rows[0];
    if (!recipe) {
      throw new NotFoundError('Recipe not found');
    }

    return res.status(StatusCodes.OK).json({ recipe });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to delete recipe'));
  }
};
