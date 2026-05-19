import express from 'express';
import {
  createIngredient,
  getIngredients,
  getSingleIngredient,
} from '../controllers/ingredientController.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  createIngredientValidation,
  getIngredientsValidation,
  getSingleIngredientValidation,
} from '../validations/ingredientValidation.js';

const router = express.Router();

router
  .route('/')
  .post(createIngredientValidation, validateRequest, createIngredient)
  .get(getIngredientsValidation, validateRequest, getIngredients);
router
  .route('/:id')
  .get(getSingleIngredientValidation, validateRequest, getSingleIngredient);

export default router;
