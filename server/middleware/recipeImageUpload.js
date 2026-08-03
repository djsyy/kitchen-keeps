import multer from 'multer';
import BadRequestError from '../errors/BadRequestError.js';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        new BadRequestError('Recipe images must be JPG, PNG, or WebP files')
      );
      return;
    }

    callback(null, true);
  },
});

export const uploadRecipeImageFile = (req, res, next) => {
  upload.single('image')(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return next(
          new BadRequestError('Recipe images must be 5 MB or smaller')
        );
      }

      return next(new BadRequestError('Upload one recipe image at a time'));
    }

    if (error instanceof BadRequestError) {
      return next(error);
    }

    return next(new BadRequestError('Unable to process recipe image'));
  });
};
