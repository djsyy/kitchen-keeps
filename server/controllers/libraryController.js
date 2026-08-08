import { query } from '../config/db.js';
import { StatusCodes } from 'http-status-codes';
import NotFoundError from '../errors/NotFoundError.js';
import InternalServerError from '../errors/InternalServerError.js';
import ConflictError from '../errors/ConflictError.js';
import BadRequestError from '../errors/BadRequestError.js';
import { buildUpdatedFields } from '../utils/buildUpdatedFields.js';
import {
  destroyLibraryCover,
  uploadLibraryCover as uploadCoverToCloudinary,
} from '../config/cloudinary.js';

const libraryDBAttributes = ['name', 'description', 'icon_key', 'color_key'];

const checkUserOwnership = async (libraryId, userId) => {
  const result = await query(
    `
      SELECT id
      FROM libraries
      WHERE id = $1 AND user_id = $2
    `,
    [libraryId, userId]
  );

  return Boolean(result.rows[0]);
};

const getOwnedLibraryCover = async (libraryId, userId) => {
  const result = await query(
    `
      SELECT id, cover_image_url, cover_image_public_id
      FROM libraries
      WHERE id = $1 AND user_id = $2
    `,
    [libraryId, userId]
  );

  return result.rows[0];
};

const removeLibraryCoverFromCloudinary = async (publicId) => {
  if (!publicId) {
    return;
  }

  try {
    await destroyLibraryCover(publicId);
  } catch (error) {
    console.error('Unable to remove library cover from Cloudinary', {
      message: error instanceof Error ? error.message : 'Unknown image error',
    });
  }
};

export const createLibrary = async (req, res, next) => {
  try {
    const {
      name,
      description,
      icon_key: iconKey = 'folder',
      color_key: colorKey = 'primary',
    } = req.body;
    const userId = req.user.userId;
    const normalizedDescription = description ?? null;

    const result = await query(
      `
      INSERT INTO libraries (user_id, name, description, icon_key, color_key)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, user_id, name, description, icon_key, color_key,
        cover_image_url, created_at
      `,
      [userId, name, normalizedDescription, iconKey, colorKey]
    );

    const library = result.rows[0];

    return res.status(StatusCodes.CREATED).json({ data: { library } });
  } catch (error) {
    if (error.code === '23505') {
      return next(new ConflictError('Library name already exists'));
    }

    return next(new InternalServerError('Unable to create library'));
  }
};

export const getLibraries = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `
      SELECT id, user_id, name, description, icon_key, color_key,
        cover_image_url, created_at
      FROM libraries
      WHERE user_id = $1
      ORDER BY name
      `,
      [userId]
    );

    return res.status(StatusCodes.OK).json({
      data: { libraries: result.rows },
      meta: { count: result.rows.length },
    });
  } catch (_error) {
    return next(new InternalServerError('Unable to fetch libraries'));
  }
};

export const getSingleLibrary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await query(
      `
      SELECT id, user_id, name, description, icon_key, color_key,
        cover_image_url, created_at
      FROM libraries
      WHERE user_id = $1 AND id = $2
      `,
      [userId, id]
    );

    const library = result.rows[0];
    if (!library) {
      throw new NotFoundError('Library not found');
    }

    const recipesResult = await query(
      `
      SELECT recipes.id, recipes.title, recipes.description, recipes.image_url,
        recipes.created_by_user_id, recipes.prep_time_minutes,
        recipes.cook_time_minutes, recipes.servings, recipes.created_at,
        recipes.updated_at
      FROM library_recipes
      INNER JOIN recipes ON recipes.id = library_recipes.recipe_id
      WHERE library_recipes.library_id = $1
        AND recipes.created_by_user_id = $2
      ORDER BY recipes.title
      `,
      [id, userId]
    );

    return res.status(StatusCodes.OK).json({
      data: { library, recipes: recipesResult.rows },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to fetch library'));
  }
};

export const addRecipeToLibrary = async (req, res, next) => {
  try {
    const { libraryId } = req.params;
    const { recipe_id: recipeId } = req.body;
    const userId = req.user.userId;
    const userOwnsLibrary = await checkUserOwnership(libraryId, userId);

    if (!userOwnsLibrary) {
      throw new NotFoundError('Library not found');
    }

    const result = await query(
      `
      INSERT INTO library_recipes (library_id, recipe_id)
      SELECT $1, id
      FROM recipes
      WHERE id = $2 AND created_by_user_id = $3
      RETURNING library_id, recipe_id, added_at, notes
      `,
      [libraryId, recipeId, userId]
    );

    const libraryRecipe = result.rows[0];
    if (!libraryRecipe) {
      throw new NotFoundError('Recipe not found');
    }

    return res.status(StatusCodes.CREATED).json({
      data: { libraryRecipe },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    if (error.code === '23505') {
      return next(new ConflictError('Recipe is already in this library'));
    }

    return next(new InternalServerError('Unable to add recipe to library'));
  }
};

export const removeRecipeFromLibrary = async (req, res, next) => {
  try {
    const { libraryId, recipeId } = req.params;
    const userId = req.user.userId;
    const userOwnsLibrary = await checkUserOwnership(libraryId, userId);

    if (!userOwnsLibrary) {
      throw new NotFoundError('Library not found');
    }

    const result = await query(
      `
      DELETE FROM library_recipes
      WHERE library_id = $1 AND recipe_id = $2
      RETURNING library_id, recipe_id, added_at, notes
      `,
      [libraryId, recipeId]
    );

    const libraryRecipe = result.rows[0];
    if (!libraryRecipe) {
      throw new NotFoundError('Recipe is not in this library');
    }

    return res.status(StatusCodes.OK).json({ data: { libraryRecipe } });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(
      new InternalServerError('Unable to remove recipe from library')
    );
  }
};

export const updateLibrary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { updatedFields, updatedValues } = buildUpdatedFields(
      req.body,
      libraryDBAttributes
    );

    updatedValues.push(userId);
    updatedValues.push(id);

    const result = await query(
      `
      UPDATE libraries
      SET ${updatedFields.join(', ')}
      WHERE user_id = $${updatedValues.length - 1} AND id = $${updatedValues.length}
      RETURNING name, description, icon_key, color_key, cover_image_url,
        user_id, id, created_at
      `,
      updatedValues
    );

    const library = result.rows[0];
    if (!library) {
      throw new NotFoundError('Library not found');
    }

    return res.status(StatusCodes.OK).json({ data: { library } });
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

export const deleteLibrary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await query(
      `
      DELETE from libraries
      WHERE user_id = $1 AND id = $2
      RETURNING id, user_id, name, description, icon_key, color_key,
        cover_image_url, cover_image_public_id, created_at
      `,
      [userId, id]
    );

    const library = result.rows[0];
    if (!library) {
      throw new NotFoundError('Library not found');
    }

    await removeLibraryCoverFromCloudinary(library.cover_image_public_id);

    const { cover_image_public_id: _coverImagePublicId, ...libraryData } =
      library;

    return res.status(StatusCodes.OK).json({ data: { library: libraryData } });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to delete library'));
  }
};

export const uploadLibraryCover = async (req, res, next) => {
  let uploadedCover;

  try {
    if (!req.file) {
      throw new BadRequestError('Library cover is required');
    }

    const { id } = req.params;
    const userId = req.user.userId;
    const library = await getOwnedLibraryCover(id, userId);

    if (!library) {
      throw new NotFoundError('Library not found');
    }

    uploadedCover = await uploadCoverToCloudinary(req.file, {
      libraryId: library.id,
      userId,
    });

    const result = await query(
      `
        UPDATE libraries
        SET cover_image_url = $1, cover_image_public_id = $2
        WHERE id = $3 AND user_id = $4
        RETURNING id, user_id, name, description, icon_key, color_key,
          cover_image_url, created_at
      `,
      [uploadedCover.secure_url, uploadedCover.public_id, id, userId]
    );

    const updatedLibrary = result.rows[0];
    if (!updatedLibrary) {
      throw new NotFoundError('Library not found');
    }

    await removeLibraryCoverFromCloudinary(library.cover_image_public_id);

    return res
      .status(StatusCodes.OK)
      .json({ data: { library: updatedLibrary } });
  } catch (error) {
    if (uploadedCover?.public_id) {
      await removeLibraryCoverFromCloudinary(uploadedCover.public_id);
    }

    if (error instanceof BadRequestError || error instanceof NotFoundError) {
      return next(error);
    }

    console.error('Unable to upload library cover to Cloudinary', {
      message: error instanceof Error ? error.message : 'Unknown image error',
    });

    return next(new InternalServerError('Unable to upload library cover'));
  }
};

export const removeLibraryCover = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const library = await getOwnedLibraryCover(id, userId);

    if (!library) {
      throw new NotFoundError('Library not found');
    }

    const result = await query(
      `
        UPDATE libraries
        SET cover_image_url = NULL, cover_image_public_id = NULL
        WHERE id = $1 AND user_id = $2
        RETURNING id, user_id, name, description, icon_key, color_key,
          cover_image_url, created_at
      `,
      [id, userId]
    );

    const updatedLibrary = result.rows[0];
    if (!updatedLibrary) {
      throw new NotFoundError('Library not found');
    }

    await removeLibraryCoverFromCloudinary(library.cover_image_public_id);

    return res
      .status(StatusCodes.OK)
      .json({ data: { library: updatedLibrary } });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }

    return next(new InternalServerError('Unable to remove library cover'));
  }
};
