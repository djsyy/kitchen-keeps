import { createApp } from '../../app.js';
import { pool } from '../../config/db.js';

export const createAuthenticatedApp = (userId) =>
  createApp({
    sessionMiddleware: (req, _res, next) => {
      req.session = { userId };
      next();
    },
  });

export const createUnauthenticatedApp = () =>
  createApp({
    sessionMiddleware: (_req, _res, next) => next(),
  });

export const createUser = async ({ name, email }) => {
  const result = await pool.query(
    `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, 'test-password-hash')
      RETURNING id, name, email
    `,
    [name, email]
  );

  return result.rows[0];
};

export const createRecipe = async ({ userId, title }) => {
  const result = await pool.query(
    `
      INSERT INTO recipes (title, created_by_user_id)
      VALUES ($1, $2)
      RETURNING id, title, created_by_user_id
    `,
    [title, userId]
  );

  return result.rows[0];
};

export const createIngredient = async ({ name, userId = null }) => {
  const result = await pool.query(
    `
      INSERT INTO ingredients (name, created_by_user_id)
      VALUES ($1, $2)
      RETURNING id, name, created_by_user_id
    `,
    [name, userId]
  );

  return result.rows[0];
};

export const createRecipeIngredient = async ({ recipeId, ingredientId }) => {
  const result = await pool.query(
    `
      INSERT INTO recipe_ingredients (
        recipe_id, ingredient_id, display_name, sort_order
      )
      SELECT $1, id, name, 1
      FROM ingredients
      WHERE id = $2
      RETURNING id, recipe_id
    `,
    [recipeId, ingredientId]
  );

  return result.rows[0];
};

export const createRecipeStep = async ({ recipeId }) => {
  const result = await pool.query(
    `
      INSERT INTO recipe_steps (recipe_id, sort_order, instruction)
      VALUES ($1, 1, 'Test instruction')
      RETURNING id, recipe_id
    `,
    [recipeId]
  );

  return result.rows[0];
};

export const createLibrary = async ({ userId, name }) => {
  const result = await pool.query(
    `
      INSERT INTO libraries (user_id, name, icon_key, color_key)
      VALUES ($1, $2, 'folder', 'primary')
      RETURNING id, user_id, name
    `,
    [userId, name]
  );

  return result.rows[0];
};

export const createCookSession = async ({ userId, recipeId }) => {
  const result = await pool.query(
    `
      INSERT INTO cook_sessions (user_id, recipe_id)
      VALUES ($1, $2)
      RETURNING id, user_id, recipe_id
    `,
    [userId, recipeId]
  );

  return result.rows[0];
};

export const addPantryItem = async ({ userId, ingredientId }) => {
  await pool.query(
    `
      INSERT INTO pantry_items (user_id, ingredient_id)
      VALUES ($1, $2)
    `,
    [userId, ingredientId]
  );
};
