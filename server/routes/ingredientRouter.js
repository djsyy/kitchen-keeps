import express from 'express';
import {
  createIngredient,
  getIngredients,
  getSingleIngredient,
  updateIngredient,
  hideIngredient,
  reactivateIngredient,
} from '../controllers/ingredientController.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  createIngredientValidation,
  getIngredientsValidation,
  getSingleIngredientValidation,
  updateIngredientValidation,
  hideIngredientValidation,
  reactivateIngredientValidation,
} from '../validations/ingredientValidation.js';

const router = express.Router();

router
  .route('/')
  .post(createIngredientValidation, validateRequest, createIngredient)
  .get(getIngredientsValidation, validateRequest, getIngredients);

router
  .route('/:id/reactivate')
  .patch(reactivateIngredientValidation, validateRequest, reactivateIngredient);

router
  .route('/:id')
  .get(getSingleIngredientValidation, validateRequest, getSingleIngredient)
  .patch(updateIngredientValidation, validateRequest, updateIngredient)
  .delete(hideIngredientValidation, validateRequest, hideIngredient);

export default router;
