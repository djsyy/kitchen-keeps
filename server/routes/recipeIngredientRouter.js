import express from 'express';
import {
  createRecipeIngredient,
  getRecipeIngredient,
  updateRecipeIngredient,
  deleteRecipeIngredient,
} from '../controllers/recipeIngredientController.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  createRecipeIngredientValidation,
  getRecipeIngredientValidation,
  updateRecipeIngredientValidation,
  deleteRecipeIngredientValidation,
} from '../validations/recipeIngredientValidation.js';

// mergeParams lets this router read recipeId from /recipes/:recipeId/ingredients
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    createRecipeIngredientValidation,
    validateRequest,
    createRecipeIngredient
  )
  .get(getRecipeIngredientValidation, validateRequest, getRecipeIngredient);

router
  .route('/:recipeIngredientId')
  .patch(
    updateRecipeIngredientValidation,
    validateRequest,
    updateRecipeIngredient
  )
  .delete(
    deleteRecipeIngredientValidation,
    validateRequest,
    deleteRecipeIngredient
  );

export default router;
