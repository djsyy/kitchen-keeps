import { getClient, query } from '../config/db.js';
import { StatusCodes } from 'http-status-codes';
import NotFoundError from '../errors/NotFoundError.js';
import InternalServerError from '../errors/InternalServerError.js';

const cookSessionFields =
  'id, user_id, recipe_id, status, created_at, updated_at, completed_at';
const cookSessionItemFields =
  'id, cook_session_id, recipe_ingredient_id, display_name, quantity_value, quantity_unit, sort_order, status, created_at, updated_at';
const cookSessionItemReturnFields =
  'cook_session_items.id, cook_session_items.cook_session_id, cook_session_items.recipe_ingredient_id, cook_session_items.display_name, cook_session_items.quantity_value, cook_session_items.quantity_unit, cook_session_items.sort_order, cook_session_items.status, cook_session_items.created_at, cook_session_items.updated_at';

// Lock the owned recipe so concurrent create requests resume the same session
const lockOwnedRecipe = async (client, recipeId, userId) => {
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

const findOwnedCookSession = async (cookSessionId, userId) => {
  const result = await query(
    `
      SELECT cook_sessions.id, cook_sessions.user_id, cook_sessions.recipe_id,
        cook_sessions.status, cook_sessions.created_at, cook_sessions.updated_at,
        cook_sessions.completed_at, recipes.title AS recipe_title
      FROM cook_sessions
      INNER JOIN recipes ON recipes.id = cook_sessions.recipe_id
      WHERE cook_sessions.id = $1 AND cook_sessions.user_id = $2
    `,
    [cookSessionId, userId]
  );

  const cookSession = result.rows[0];
  if (!cookSession) {
    throw new NotFoundError('Cook session not found');
  }

  return cookSession;
};

export const createCookSession = async (req, res, next) => {
  let client;

  try {
    const { recipeId } = req.params;
    const userId = req.user.userId;

    client = await getClient();
    await client.query('BEGIN');
    await lockOwnedRecipe(client, recipeId, userId);

    const activeSessionResult = await client.query(
      `
        SELECT ${cookSessionFields}
        FROM cook_sessions
        WHERE user_id = $1 AND recipe_id = $2 AND status = 'active'
        FOR UPDATE
      `,
      [userId, recipeId]
    );
    const activeCookSession = activeSessionResult.rows[0];

    if (activeCookSession) {
      await client.query('COMMIT');

      return res.status(StatusCodes.OK).json({
        data: { cookSession: activeCookSession, resumed: true },
      });
    }

    const createdSessionResult = await client.query(
      `
        INSERT INTO cook_sessions (user_id, recipe_id)
        VALUES ($1, $2)
        RETURNING ${cookSessionFields}
      `,
      [userId, recipeId]
    );
    const cookSession = createdSessionResult.rows[0];

    // Snapshot the recipe's current ingredients so later recipe edits do not change this list
    await client.query(
      `
        INSERT INTO cook_session_items (
          cook_session_id,
          recipe_ingredient_id,
          display_name,
          quantity_value,
          quantity_unit,
          sort_order
        )
        SELECT $1, id, display_name, quantity_value, quantity_unit, sort_order
        FROM recipe_ingredients
        WHERE recipe_id = $2
        ORDER BY sort_order, id
      `,
      [cookSession.id, recipeId]
    );

    await client.query('COMMIT');

    return res.status(StatusCodes.CREATED).json({
      data: { cookSession, resumed: false },
    });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }

    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to create cook session'));
  } finally {
    if (client) {
      client.release();
    }
  }
};

export const getCookSessions = async (req, res, next) => {
  try {
    const status = req.query.status ?? 'active';
    const userId = req.user.userId;

    const result = await query(
      `
        SELECT cook_sessions.id, cook_sessions.user_id, cook_sessions.recipe_id,
          cook_sessions.status, cook_sessions.created_at, cook_sessions.updated_at,
          cook_sessions.completed_at, recipes.title AS recipe_title,
          COUNT(cook_session_items.id)::integer AS item_count,
          COUNT(cook_session_items.id) FILTER (
            WHERE cook_session_items.status IS NULL
          )::integer AS unchecked_count,
          COUNT(cook_session_items.id) FILTER (
            WHERE cook_session_items.status = 'unknown'
          )::integer AS unknown_count,
          COUNT(cook_session_items.id) FILTER (
            WHERE cook_session_items.status = 'have'
          )::integer AS have_count,
          COUNT(cook_session_items.id) FILTER (
            WHERE cook_session_items.status = 'need'
          )::integer AS need_count
        FROM cook_sessions
        INNER JOIN recipes ON recipes.id = cook_sessions.recipe_id
        LEFT JOIN cook_session_items
          ON cook_session_items.cook_session_id = cook_sessions.id
        WHERE cook_sessions.user_id = $1 AND cook_sessions.status = $2
        GROUP BY cook_sessions.id, recipes.title
        ORDER BY cook_sessions.updated_at DESC
      `,
      [userId, status]
    );

    return res.status(StatusCodes.OK).json({
      data: { cookSessions: result.rows },
      meta: { count: result.rows.length },
    });
  } catch (_error) {
    return next(new InternalServerError('Unable to fetch cook sessions'));
  }
};

export const getCookSession = async (req, res, next) => {
  try {
    const { cookSessionId } = req.params;
    const userId = req.user.userId;
    const cookSession = await findOwnedCookSession(cookSessionId, userId);

    const itemsResult = await query(
      `
        SELECT ${cookSessionItemFields}
        FROM cook_session_items
        WHERE cook_session_id = $1
        ORDER BY sort_order, id
      `,
      [cookSession.id]
    );

    return res.status(StatusCodes.OK).json({
      data: { cookSession, items: itemsResult.rows },
      meta: { count: itemsResult.rows.length },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to fetch cook session'));
  }
};

export const updateCookSessionItem = async (req, res, next) => {
  try {
    const { cookSessionId, cookSessionItemId } = req.params;
    const userId = req.user.userId;

    // Only active sessions owned by the user can update their ingredient status
    const result = await query(
      `
        UPDATE cook_session_items
        SET status = $1
        FROM cook_sessions
        WHERE cook_session_items.id = $2
          AND cook_session_items.cook_session_id = $3
          AND cook_sessions.id = cook_session_items.cook_session_id
          AND cook_sessions.user_id = $4
          AND cook_sessions.status = 'active'
        RETURNING ${cookSessionItemReturnFields}
      `,
      [req.body.status, cookSessionItemId, cookSessionId, userId]
    );

    const cookSessionItem = result.rows[0];
    if (!cookSessionItem) {
      throw new NotFoundError('Active cook session item not found');
    }

    return res.status(StatusCodes.OK).json({
      data: { cookSessionItem },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to update cook session item'));
  }
};

export const completeCookSession = async (req, res, next) => {
  try {
    const { cookSessionId } = req.params;
    const userId = req.user.userId;

    const result = await query(
      `
        UPDATE cook_sessions
        SET status = 'completed', completed_at = NOW()
        WHERE id = $1 AND user_id = $2 AND status = 'active'
        RETURNING ${cookSessionFields}
      `,
      [cookSessionId, userId]
    );

    const cookSession = result.rows[0];
    if (!cookSession) {
      throw new NotFoundError('Active cook session not found');
    }

    return res.status(StatusCodes.OK).json({ data: { cookSession } });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to complete cook session'));
  }
};

export const cancelCookSession = async (req, res, next) => {
  try {
    const { cookSessionId } = req.params;
    const userId = req.user.userId;

    const result = await query(
      `
        UPDATE cook_sessions
        SET status = 'cancelled'
        WHERE id = $1 AND user_id = $2 AND status = 'active'
        RETURNING ${cookSessionFields}
      `,
      [cookSessionId, userId]
    );

    const cookSession = result.rows[0];
    if (!cookSession) {
      throw new NotFoundError('Active cook session not found');
    }

    return res.status(StatusCodes.OK).json({ data: { cookSession } });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to cancel cook session'));
  }
};
