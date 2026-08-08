import { StatusCodes } from 'http-status-codes';
import { query } from '../config/db.js';
import ConflictError from '../errors/ConflictError.js';
import InternalServerError from '../errors/InternalServerError.js';
import NotFoundError from '../errors/NotFoundError.js';

const pantryItemFields = `
  pantry_items.id,
  pantry_items.ingredient_id,
  ingredients.name,
  ingredients.created_by_user_id,
  pantry_items.created_at
`;

const getVisibleIngredient = async (ingredientId, userId) => {
  const result = await query(
    `
      SELECT id, name, created_by_user_id
      FROM ingredients
      WHERE id = $1
        AND status = 'active'
        AND (created_by_user_id IS NULL OR created_by_user_id = $2)
    `,
    [ingredientId, userId]
  );

  return result.rows[0];
};

export const getPantry = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const [pantryResult, recommendationsResult, eligibilityResult] =
      await Promise.all([
        query(
          `
          SELECT ${pantryItemFields}
          FROM pantry_items
          INNER JOIN ingredients ON ingredients.id = pantry_items.ingredient_id
          WHERE pantry_items.user_id = $1
            AND ingredients.status = 'active'
            AND (ingredients.created_by_user_id IS NULL OR ingredients.created_by_user_id = $1)
          ORDER BY ingredients.name, pantry_items.id
        `,
          [userId]
        ),
        query(
          `
          SELECT recipes.id, recipes.title, recipes.description, recipes.image_url,
            recipes.prep_time_minutes, recipes.cook_time_minutes, recipes.servings,
            recipes.created_at, recipes.updated_at,
            COUNT(recipe_ingredients.id)::integer AS ingredient_count
          FROM recipes
          INNER JOIN recipe_ingredients
            ON recipe_ingredients.recipe_id = recipes.id
          INNER JOIN ingredients
            ON ingredients.id = recipe_ingredients.ingredient_id
            AND ingredients.status = 'active'
          INNER JOIN pantry_items
            ON pantry_items.ingredient_id = recipe_ingredients.ingredient_id
            AND pantry_items.user_id = $1
          WHERE recipes.created_by_user_id = $1
          GROUP BY recipes.id, recipes.title, recipes.description, recipes.image_url,
            recipes.prep_time_minutes, recipes.cook_time_minutes, recipes.servings,
            recipes.created_at, recipes.updated_at
          HAVING COUNT(recipe_ingredients.id) = (
            SELECT COUNT(*)
            FROM recipe_ingredients AS all_recipe_ingredients
            WHERE all_recipe_ingredients.recipe_id = recipes.id
          )
          ORDER BY recipes.updated_at DESC, recipes.id DESC
        `,
          [userId]
        ),
        query(
          `
          SELECT COUNT(DISTINCT recipes.id)::integer AS unlinked_recipe_count
          FROM recipes
          INNER JOIN recipe_ingredients
            ON recipe_ingredients.recipe_id = recipes.id
          WHERE recipes.created_by_user_id = $1
            AND recipe_ingredients.ingredient_id IS NULL
        `,
          [userId]
        ),
      ]);

    return res.status(StatusCodes.OK).json({
      data: {
        pantryItems: pantryResult.rows,
        recommendations: recommendationsResult.rows,
        recommendationEligibility: {
          unlinkedRecipeCount:
            eligibilityResult.rows[0]?.unlinked_recipe_count ?? 0,
        },
      },
      meta: { count: pantryResult.rows.length },
    });
  } catch (_error) {
    return next(new InternalServerError('Unable to fetch pantry'));
  }
};

export const addPantryItem = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const ingredient = await getVisibleIngredient(
      req.body.ingredient_id,
      userId
    );

    if (!ingredient) {
      throw new NotFoundError('Ingredient not found');
    }

    const result = await query(
      `
        INSERT INTO pantry_items (user_id, ingredient_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, ingredient_id) DO NOTHING
        RETURNING id, ingredient_id, created_at
      `,
      [userId, ingredient.id]
    );

    const pantryItem = result.rows[0];
    if (!pantryItem) {
      throw new ConflictError('Ingredient is already in your pantry');
    }

    return res.status(StatusCodes.CREATED).json({
      data: {
        pantryItem: {
          ...pantryItem,
          name: ingredient.name,
          created_by_user_id: ingredient.created_by_user_id,
        },
      },
    });
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ConflictError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to add pantry item'));
  }
};

export const createPrivatePantryItem = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const existingIngredientResult = await query(
      `
        SELECT id
        FROM ingredients
        WHERE name = $1
          AND status = 'active'
          AND (created_by_user_id IS NULL OR created_by_user_id = $2)
        LIMIT 1
      `,
      [req.body.name, userId]
    );

    if (existingIngredientResult.rows[0]) {
      throw new ConflictError('Ingredient already exists');
    }

    const result = await query(
      `
        WITH created_ingredient AS (
          INSERT INTO ingredients (name, created_by_user_id)
          VALUES ($1, $2)
          RETURNING id, name, created_by_user_id
        ), created_pantry_item AS (
          INSERT INTO pantry_items (user_id, ingredient_id)
          SELECT $2, id
          FROM created_ingredient
          RETURNING id, ingredient_id, created_at
        )
        SELECT created_pantry_item.id, created_pantry_item.ingredient_id,
          created_pantry_item.created_at, created_ingredient.name,
          created_ingredient.created_by_user_id
        FROM created_pantry_item
        INNER JOIN created_ingredient ON true
      `,
      [req.body.name, userId]
    );

    const pantryItem = result.rows[0];
    return res.status(StatusCodes.CREATED).json({
      data: { pantryItem },
    });
  } catch (error) {
    if (error instanceof ConflictError || error.code === '23505') {
      return next(new ConflictError('Ingredient already exists'));
    }

    return next(new InternalServerError('Unable to create pantry item'));
  }
};

export const removePantryItem = async (req, res, next) => {
  try {
    const result = await query(
      `
        DELETE FROM pantry_items
        WHERE user_id = $1 AND ingredient_id = $2
        RETURNING id, ingredient_id, created_at
      `,
      [req.user.userId, req.params.ingredientId]
    );

    const pantryItem = result.rows[0];
    if (!pantryItem) {
      throw new NotFoundError('Pantry item not found');
    }

    return res.status(StatusCodes.OK).json({ data: { pantryItem } });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to remove pantry item'));
  }
};
