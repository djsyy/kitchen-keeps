import { query } from '../config/db.js';
import { StatusCodes } from 'http-status-codes';
import InternalServerError from '../errors/InternalServerError.js';
import { expireStaleCookSessions } from '../utils/cookSessionExpiry.js';

export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await expireStaleCookSessions({ query }, userId);

    const [metricsResult, recipesResult, librariesResult, cookSessionResult] =
      await Promise.all([
        query(
          `
            SELECT
              (SELECT COUNT(*)::integer FROM recipes WHERE created_by_user_id = $1) AS recipe_count,
              (SELECT COUNT(*)::integer FROM pantry_items WHERE user_id = $1) AS pantry_count,
              (SELECT COUNT(*)::integer FROM libraries WHERE user_id = $1) AS library_count
          `,
          [userId]
        ),
        query(
          `
            SELECT recipes.id, recipes.title, recipes.image_url,
              recipes.updated_at,
              COUNT(DISTINCT recipe_ingredients.id)::integer AS ingredient_count,
              COALESCE(
                ARRAY_AGG(DISTINCT libraries.name) FILTER (WHERE libraries.name IS NOT NULL),
                '{}'::text[]
              ) AS library_names
            FROM recipes
            LEFT JOIN recipe_ingredients
              ON recipe_ingredients.recipe_id = recipes.id
            LEFT JOIN library_recipes
              ON library_recipes.recipe_id = recipes.id
            LEFT JOIN libraries
              ON libraries.id = library_recipes.library_id
              AND libraries.user_id = $1
            WHERE recipes.created_by_user_id = $1
            GROUP BY recipes.id, recipes.title, recipes.image_url, recipes.updated_at
            ORDER BY recipes.updated_at DESC, recipes.id DESC
            LIMIT 3
          `,
          [userId]
        ),
        query(
          `
            SELECT libraries.id, libraries.name, libraries.description,
              libraries.icon_key, libraries.color_key, libraries.cover_image_url,
              libraries.created_at,
              COUNT(library_recipes.recipe_id)::integer AS recipe_count,
              COALESCE(MAX(library_recipes.added_at), libraries.created_at) AS updated_at
            FROM libraries
            LEFT JOIN library_recipes
              ON library_recipes.library_id = libraries.id
            WHERE libraries.user_id = $1
            GROUP BY libraries.id, libraries.name, libraries.description,
              libraries.icon_key, libraries.color_key, libraries.cover_image_url,
              libraries.created_at
            ORDER BY updated_at DESC, libraries.id DESC
            LIMIT 3
          `,
          [userId]
        ),
        query(
          `
            SELECT cook_sessions.id, cook_sessions.recipe_id,
              cook_sessions.updated_at, recipes.title AS recipe_title,
              COUNT(cook_session_items.id)::integer AS item_count,
              COUNT(cook_session_items.id) FILTER (
                WHERE cook_session_items.status IS NULL
              )::integer AS unchecked_count,
              COUNT(cook_session_items.id) FILTER (
                WHERE cook_session_items.status IS NOT NULL
              )::integer AS checked_count
            FROM cook_sessions
            INNER JOIN recipes ON recipes.id = cook_sessions.recipe_id
            LEFT JOIN cook_session_items
              ON cook_session_items.cook_session_id = cook_sessions.id
            WHERE cook_sessions.user_id = $1
              AND cook_sessions.status = 'active'
            GROUP BY cook_sessions.id, cook_sessions.recipe_id,
              cook_sessions.updated_at, recipes.title
            ORDER BY cook_sessions.updated_at DESC, cook_sessions.id DESC
            LIMIT 1
          `,
          [userId]
        ),
      ]);

    return res.status(StatusCodes.OK).json({
      data: {
        metrics: metricsResult.rows[0],
        recipes: recipesResult.rows,
        libraries: librariesResult.rows,
        activeCookSession: cookSessionResult.rows[0] ?? null,
      },
    });
  } catch (_error) {
    return next(new InternalServerError('Unable to fetch dashboard'));
  }
};
