import { afterAll, beforeAll, beforeEach } from 'vitest';
import { pool } from '../../config/db.js';

const resetTestData = async () => {
  await pool.query(`
    TRUNCATE TABLE
      user_sessions,
      password_reset_tokens,
      pantry_items,
      cook_session_items,
      cook_sessions,
      recipe_steps,
      library_recipes,
      recipe_ingredients,
      recipes,
      libraries
    RESTART IDENTITY
  `);

  await pool.query(`
    DELETE FROM ingredients
    WHERE created_by_user_id IS NOT NULL
  `);
  await pool.query('DELETE FROM users');
  await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
};

beforeAll(async () => {
  const { rows } = await pool.query('SELECT current_database() AS name');
  if (!rows[0]?.name.endsWith('_test')) {
    throw new Error('Integration tests require a database ending in _test');
  }
});

beforeEach(resetTestData);
afterAll(() => pool.end());
