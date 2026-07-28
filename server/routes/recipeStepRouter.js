import express from 'express';
import {
  createRecipeStep,
  deleteRecipeStep,
  getRecipeSteps,
  reorderRecipeSteps,
  updateRecipeStep,
} from '../controllers/recipeStepController.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  createRecipeStepValidation,
  deleteRecipeStepValidation,
  getRecipeStepsValidation,
  reorderRecipeStepsValidation,
  updateRecipeStepValidation,
} from '../validations/recipeStepValidation.js';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(createRecipeStepValidation, validateRequest, createRecipeStep)
  .get(getRecipeStepsValidation, validateRequest, getRecipeSteps);

router.patch(
  '/reorder',
  reorderRecipeStepsValidation,
  validateRequest,
  reorderRecipeSteps
);

router
  .route('/:recipeStepId')
  .patch(updateRecipeStepValidation, validateRequest, updateRecipeStep)
  .delete(deleteRecipeStepValidation, validateRequest, deleteRecipeStep);

export default router;
