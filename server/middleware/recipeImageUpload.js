import multer from 'multer';
import sharp from 'sharp';
import BadRequestError from '../errors/BadRequestError.js';

const allowedImageFormats = new Set(['jpeg', 'png', 'webp']);
const maxImageDimension = 8000;
const maxImagePixels = 20_000_000;

const createInvalidImageError = (label) =>
  new BadRequestError(`${label} must be JPG, PNG, or WebP files`);

const validateImage = async (file, label) => {
  let metadata;

  try {
    metadata = await sharp(file.buffer, {
      failOn: 'error',
      limitInputPixels: maxImagePixels,
    }).metadata();
  } catch (_error) {
    throw createInvalidImageError(label);
  }

  if (
    !allowedImageFormats.has(metadata.format) ||
    !metadata.width ||
    !metadata.height
  ) {
    throw createInvalidImageError(label);
  }

  if (
    metadata.width > maxImageDimension ||
    metadata.height > maxImageDimension ||
    metadata.width * metadata.height > maxImagePixels
  ) {
    throw new BadRequestError(
      `${label} must be 8,000 pixels or less on each side and no more than 20 megapixels`
    );
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

const createImageUploadMiddleware = (label) => (req, res, next) => {
  upload.single('image')(req, res, async (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return next(new BadRequestError(`${label} must be 5 MB or smaller`));
      }

      return next(
        new BadRequestError(
          `Upload one ${label.toLowerCase().replace(/s$/, '')} at a time`
        )
      );
    }

    if (error) {
      return next(new BadRequestError('Unable to process recipe image'));
    }

    if (!req.file) {
      return next();
    }

    try {
      await validateImage(req.file, label);
    } catch (validationError) {
      if (validationError instanceof BadRequestError) {
        return next(validationError);
      }

      return next(new BadRequestError('Unable to process recipe image'));
    }

    return next();
  });
};

export const uploadRecipeImageFile =
  createImageUploadMiddleware('Recipe images');
export const uploadLibraryCoverFile =
  createImageUploadMiddleware('Library covers');
