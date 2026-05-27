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

const router = express.Router();

router
  .route('/')
  .post(createRecipeValidation, validateRequest, createRecipe)
  .get(getRecipesValidation, validateRequest, getRecipes);
router
  .route('/:id')
  .get(getSingleRecipeValidation, validateRequest, getSingleRecipe)
  .delete(deleteRecipeValidation, validateRequest, deleteRecipe)
  .patch(updateRecipeValidation, validateRequest, updateRecipe);

export default router;
