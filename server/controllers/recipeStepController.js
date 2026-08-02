import { getClient, query } from '../config/db.js';
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../errors/BadRequestError.js';
import InternalServerError from '../errors/InternalServerError.js';
import NotFoundError from '../errors/NotFoundError.js';
import { lockOwnedRecipe, userOwnsRecipe } from '../utils/recipeOwnership.js';

const recipeStepFields =
  'id, recipe_id, sort_order, instruction, created_at, updated_at';

const hasSameIds = (currentIds, submittedIds) => {
  if (currentIds.length !== submittedIds.length) {
    return false;
  }

  const currentIdSet = new Set(currentIds.map(Number));
  const normalizedSubmittedIds = submittedIds.map(Number);
  const submittedIdSet = new Set(normalizedSubmittedIds);

  return (
    submittedIdSet.size === normalizedSubmittedIds.length &&
    normalizedSubmittedIds.every((id) => currentIdSet.has(id))
  );
};

export const createRecipeStep = async (req, res, next) => {
  let client;

  try {
    const { recipeId } = req.params;
    const { instruction } = req.body;

    client = await getClient();
    await client.query('BEGIN');
    await lockOwnedRecipe(client, recipeId, req.user.userId);

    const nextSortOrderResult = await client.query(
      `
        SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_sort_order
        FROM recipe_steps
        WHERE recipe_id = $1
      `,
      [recipeId]
    );

    const result = await client.query(
      `
        INSERT INTO recipe_steps (recipe_id, sort_order, instruction)
        VALUES ($1, $2, $3)
        RETURNING ${recipeStepFields}
      `,
      [recipeId, nextSortOrderResult.rows[0].next_sort_order, instruction]
    );

    await client.query('COMMIT');

    return res.status(StatusCodes.CREATED).json({
      data: { recipeStep: result.rows[0] },
    });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }

    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to create recipe step'));
  } finally {
    if (client) {
      client.release();
    }
  }
};

export const getRecipeSteps = async (req, res, next) => {
  try {
    const { recipeId } = req.params;

    if (!(await userOwnsRecipe(recipeId, req.user.userId))) {
      throw new NotFoundError('Recipe not found');
    }

    const result = await query(
      `
        SELECT ${recipeStepFields}
        FROM recipe_steps
        WHERE recipe_id = $1
        ORDER BY sort_order, id
      `,
      [recipeId]
    );

    return res.status(StatusCodes.OK).json({
      data: { recipeSteps: result.rows },
      meta: { count: result.rows.length },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to fetch recipe steps'));
  }
};

export const updateRecipeStep = async (req, res, next) => {
  try {
    const { recipeId, recipeStepId } = req.params;

    if (!(await userOwnsRecipe(recipeId, req.user.userId))) {
      throw new NotFoundError('Recipe not found');
    }

    const result = await query(
      `
        UPDATE recipe_steps
        SET instruction = $1
        WHERE id = $2 AND recipe_id = $3
        RETURNING ${recipeStepFields}
      `,
      [req.body.instruction, recipeStepId, recipeId]
    );

    const recipeStep = result.rows[0];
    if (!recipeStep) {
      throw new NotFoundError('Recipe step not found');
    }

    return res.status(StatusCodes.OK).json({ data: { recipeStep } });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to update recipe step'));
  }
};

export const deleteRecipeStep = async (req, res, next) => {
  let client;

  try {
    const { recipeId, recipeStepId } = req.params;

    client = await getClient();
    await client.query('BEGIN');
    await lockOwnedRecipe(client, recipeId, req.user.userId);

    const result = await client.query(
      `
        DELETE FROM recipe_steps
        WHERE id = $1 AND recipe_id = $2
        RETURNING ${recipeStepFields}
      `,
      [recipeStepId, recipeId]
    );

    const recipeStep = result.rows[0];
    if (!recipeStep) {
      throw new NotFoundError('Recipe step not found');
    }

    await client.query(
      `
        UPDATE recipe_steps
        SET sort_order = sort_order - 1
        WHERE recipe_id = $1 AND sort_order > $2
      `,
      [recipeId, recipeStep.sort_order]
    );

    await client.query('COMMIT');

    return res.status(StatusCodes.OK).json({ data: { recipeStep } });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }

    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to delete recipe step'));
  } finally {
    if (client) {
      client.release();
    }
  }
};

export const reorderRecipeSteps = async (req, res, next) => {
  let client;

  try {
    const { recipeId } = req.params;
    const { recipeStepIds } = req.body;

    client = await getClient();
    await client.query('BEGIN');
    await lockOwnedRecipe(client, recipeId, req.user.userId);

    const currentStepsResult = await client.query(
      `
        SELECT id
        FROM recipe_steps
        WHERE recipe_id = $1
      `,
      [recipeId]
    );
    const currentStepIds = currentStepsResult.rows.map((step) => step.id);

    if (!hasSameIds(currentStepIds, recipeStepIds)) {
      throw new BadRequestError('Recipe step ids must match this recipe');
    }

    for (const [index, recipeStepId] of recipeStepIds.entries()) {
      await client.query(
        `
          UPDATE recipe_steps
          SET sort_order = $1
          WHERE id = $2 AND recipe_id = $3
        `,
        [index + 1, recipeStepId, recipeId]
      );
    }

    const updatedStepsResult = await client.query(
      `
        SELECT ${recipeStepFields}
        FROM recipe_steps
        WHERE recipe_id = $1
        ORDER BY sort_order, id
      `,
      [recipeId]
    );

    await client.query('COMMIT');

    return res.status(StatusCodes.OK).json({
      data: { recipeSteps: updatedStepsResult.rows },
      meta: { count: updatedStepsResult.rows.length },
    });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }

    if (error instanceof NotFoundError || error instanceof BadRequestError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to reorder recipe steps'));
  } finally {
    if (client) {
      client.release();
    }
  }
};
