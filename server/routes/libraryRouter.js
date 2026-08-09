import express from 'express';
import {
  createLibrary,
  addRecipeToLibrary,
  removeRecipeFromLibrary,
  getLibraries,
  getSingleLibrary,
  updateLibrary,
  deleteLibrary,
  uploadLibraryCover,
  removeLibraryCover,
} from '../controllers/libraryController.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  createLibraryValidation,
  addRecipeToLibraryValidation,
  removeRecipeFromLibraryValidation,
  getSingleLibraryValidation,
  updateLibraryValidation,
  deleteLibraryValidation,
} from '../validations/libraryValidation.js';
import { uploadLibraryCoverFile } from '../middleware/recipeImageUpload.js';
import { imageUploadRateLimiter } from '../middleware/rateLimiters.js';

const router = express.Router();

router
  .route('/')
  .post(createLibraryValidation, validateRequest, createLibrary)
  .get(getLibraries);

router.post(
  '/:libraryId/recipes',
  addRecipeToLibraryValidation,
  validateRequest,
  addRecipeToLibrary
);

router.delete(
  '/:libraryId/recipes/:recipeId',
  removeRecipeFromLibraryValidation,
  validateRequest,
  removeRecipeFromLibrary
);

router
  .route('/:id/cover')
  .post(
    getSingleLibraryValidation,
    validateRequest,
    imageUploadRateLimiter,
    uploadLibraryCoverFile,
    uploadLibraryCover
  )
  .delete(getSingleLibraryValidation, validateRequest, removeLibraryCover);

router
  .route('/:id')
  .get(getSingleLibraryValidation, validateRequest, getSingleLibrary)
  .delete(deleteLibraryValidation, validateRequest, deleteLibrary)
  .patch(updateLibraryValidation, validateRequest, updateLibrary);

export default router;
