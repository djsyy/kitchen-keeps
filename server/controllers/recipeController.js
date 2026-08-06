import { query } from '../config/db.js';
import { StatusCodes } from 'http-status-codes';
import NotFoundError from '../errors/NotFoundError.js';
import InternalServerError from '../errors/InternalServerError.js';
import ConflictError from '../errors/ConflictError.js';
import BadRequestError from '../errors/BadRequestError.js';
import { buildUpdatedFields } from '../utils/buildUpdatedFields.js';
import {
  destroyRecipeImage,
  uploadRecipeImage as uploadToCloudinary,
} from '../config/cloudinary.js';

const recipeDBAttributes = [
  'title',
  'description',
  'prep_time_minutes',
  'cook_time_minutes',
  'servings',
];

const getOwnedRecipeImage = async (recipeId, userId) => {
  const result = await query(
    `
      SELECT id, image_url, image_public_id
      FROM recipes
      WHERE id = $1 AND created_by_user_id = $2
    `,
    [recipeId, userId]
  );

  return result.rows[0];
};

const removeCloudinaryImage = async (publicId) => {
  if (!publicId) {
    return;
  }

  try {
    await destroyRecipeImage(publicId);
  } catch (error) {
    console.error('Unable to remove recipe image from Cloudinary', {
      message: error instanceof Error ? error.message : 'Unknown image error',
    });
  }
};

export const createRecipe = async (req, res, next) => {
  try {
    const {
      title,
      description,
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
        null,
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
      RETURNING id, title, description, image_url, image_public_id, created_by_user_id, prep_time_minutes, cook_time_minutes, servings, created_at, updated_at
      `,
      [userId, id]
    );

    const recipe = result.rows[0];
    if (!recipe) {
      throw new NotFoundError('Recipe not found');
    }

    await removeCloudinaryImage(recipe.image_public_id);

    const { image_public_id: _imagePublicId, ...recipeData } = recipe;

    return res.status(StatusCodes.OK).json({ data: { recipe: recipeData } });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to delete recipe'));
  }
};

export const uploadRecipeImage = async (req, res, next) => {
  let uploadedImage;

  try {
    if (!req.file) {
      throw new BadRequestError('Recipe image is required');
    }

    const { id } = req.params;
    const userId = req.user.userId;
    const recipe = await getOwnedRecipeImage(id, userId);

    if (!recipe) {
      throw new NotFoundError('Recipe not found');
    }

    uploadedImage = await uploadToCloudinary(req.file, {
      recipeId: recipe.id,
      userId,
    });

    const result = await query(
      `
      UPDATE recipes
      SET image_url = $1, image_public_id = $2
      WHERE id = $3 AND created_by_user_id = $4
      RETURNING id, title, description, image_url, created_by_user_id, prep_time_minutes, cook_time_minutes, servings, created_at, updated_at
      `,
      [uploadedImage.secure_url, uploadedImage.public_id, id, userId]
    );

    const updatedRecipe = result.rows[0];
    if (!updatedRecipe) {
      throw new NotFoundError('Recipe not found');
    }

    await removeCloudinaryImage(recipe.image_public_id);

    return res.status(StatusCodes.OK).json({ data: { recipe: updatedRecipe } });
  } catch (error) {
    if (uploadedImage?.public_id) {
      await removeCloudinaryImage(uploadedImage.public_id);
    }

    if (error instanceof BadRequestError || error instanceof NotFoundError) {
      return next(error);
    }

    console.error('Unable to upload recipe image to Cloudinary', {
      message: error instanceof Error ? error.message : 'Unknown image error',
    });

    return next(new InternalServerError('Unable to upload recipe image'));
  }
};

export const removeRecipeImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const recipe = await getOwnedRecipeImage(id, userId);

    if (!recipe) {
      throw new NotFoundError('Recipe not found');
    }

    const result = await query(
      `
      UPDATE recipes
      SET image_url = NULL, image_public_id = NULL
      WHERE id = $1 AND created_by_user_id = $2
      RETURNING id, title, description, image_url, created_by_user_id, prep_time_minutes, cook_time_minutes, servings, created_at, updated_at
      `,
      [id, userId]
    );

    const updatedRecipe = result.rows[0];
    if (!updatedRecipe) {
      throw new NotFoundError('Recipe not found');
    }

    await removeCloudinaryImage(recipe.image_public_id);

    return res.status(StatusCodes.OK).json({ data: { recipe: updatedRecipe } });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to remove recipe image'));
  }
};
