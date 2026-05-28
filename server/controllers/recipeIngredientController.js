import { query } from '../config/db.js';
import { StatusCodes } from 'http-status-codes';
import NotFoundError from '../errors/NotFoundError.js';
import InternalServerError from '../errors/InternalServerError.js';
import ConflictError from '../errors/ConflictError.js';
import UnauthorizedError from '../errors/UnauthorizedError.js';

const recipeIngredientDBAttributes = [
  'ingredient_id',
  'quantity_value',
  'quantity_unit',
  'preparation_note',
  'sort_order',
  'display_name',
];

// Helper function to make sure recipe owner and the current user matches
const checkUserOwnership = async (recipeId, userId) => {
  const result = await query(
    `
      SELECT id
      FROM recipe
      WHERE id = $1 AND created_by_user_id = $2
      `,
    [recipeId, userId]
  );

  return Boolean(result.rows[0]);
};

export const createRecipeIngredient = async (req, res, next) => {
  try {
    const {
      ingredient_id,
      quantity_value,
      quantity_unit,
      preparation_note,
      sort_order,
      display_name,
    } = req.body;
    const { recipeId } = req.params;
    const userId = req.user.userId;

    const userOwnsRecipe = await checkUserOwnership(recipeId, userId);

    if (!userOwnsRecipe) {
      throw new NotFoundError('Recipe not found');
    }

    // If ingredient id is provided, ensure it exists and can be accessed by the user
    if (ingredient_id) {
      const ingredient = await query(
        `
        SELECT id, name, status, created_by_user_id
        FROM ingredients
        WHERE id = $1 AND status = 'active' AND (created_by_user_id IS NULL OR created_by_user_id = $2)
        `,
        [ingredient_id, userId]
      );

      if (!ingredient.rows[0]) {
        throw new NotFoundError('Ingredient not found');
      }
    }

    let normalizedSortOrder = sort_order;

    // If user did not provide a sort order, automatically provide the correct value
    if (normalizedSortOrder === undefined || normalizedSortOrder === null) {
      // COALESCE checks for the first value thaat isn't null
      const sortOrderResult = await query(
        `
        SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_sort_order
        FROM recipe_ingredients
        WHERE recipe_id = $1
        `,
        [recipeId]
      );

      normalizedSortOrder = sortOrderResult.rows[0].next_sort_order;
    }

    const result = await query(
      `
      INSERT INTO recipes_ingredients (recipe_id, ingredient_id, quantity_value, quantity_unit, preparation_note, sort_order, display_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, recipe_id, ingredient_id, quantity_value, quantity_unit, preparation_note, sort_order, display_name, created_at, updated_at
      `,
      [
        recipeId,
        ingredient_id ?? null,
        quantity_value ?? null,
        quantity_unit ?? null,
        preparation_note ?? null,
        normalizedSortOrder,
        display_name,
      ]
    );

    const recipeIngredient = result.rows[0];

    return res.status(StatusCodes.CREATED).json({ data: { recipeIngredient } });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to create recipe ingredient'));
  }
};

export const getRecipeIngredient = async (req, res, next) => {
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

export const updateRecipeIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { updatedFields, updatedValues } = buildUpdatedRecipeFields(req);

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

export const deleteRecipeIngredient = async (req, res, next) => {
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
