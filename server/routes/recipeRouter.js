import express from 'express';
import {
  createRecipe,
  getRecipes,
  getSingleRecipe,
  updateRecipe,
  deleteRecipe,
} from '../controllers/recipeController.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  createRecipeValidation,
  getRecipesValidation,
  getSingleRecipeValidation,
  updateRecipeValidation,
  deleteRecipeValidation,
} from '../validations/recipeValidation.js';
import recipeIngredientRouter from './recipeIngredientRouter.js';
import recipeStepRouter from './recipeStepRouter.js';
import { recipeCookSessionRouter } from './cookSessionRouter.js';

const router = express.Router();

router
  .route('/')
  .post(createRecipeValidation, validateRequest, createRecipe)
  .get(getRecipesValidation, validateRequest, getRecipes);

router.use('/:recipeId/ingredients', recipeIngredientRouter);
router.use('/:recipeId/steps', recipeStepRouter);
router.use('/:recipeId/cook-sessions', recipeCookSessionRouter);

router
  .route('/:id')
  .get(getSingleRecipeValidation, validateRequest, getSingleRecipe)
  .delete(deleteRecipeValidation, validateRequest, deleteRecipe)
  .patch(updateRecipeValidation, validateRequest, updateRecipe);

export default router;
