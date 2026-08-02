import { query } from '../config/db.js';
import NotFoundError from '../errors/NotFoundError.js';

export const userOwnsRecipe = async (recipeId, userId) => {
  const result = await query(
    `
      SELECT id
      FROM recipes
      WHERE id = $1 AND created_by_user_id = $2
    `,
    [recipeId, userId]
  );

  return Boolean(result.rows[0]);
};

// Lock the owned recipe before dependent writes to prevent concurrent changes.
export const lockOwnedRecipe = async (client, recipeId, userId) => {
  const result = await client.query(
    `
      SELECT id
      FROM recipes
      WHERE id = $1 AND created_by_user_id = $2
      FOR UPDATE
    `,
    [recipeId, userId]
  );

  if (!result.rows[0]) {
    throw new NotFoundError('Recipe not found');
  }
};
