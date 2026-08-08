import { body } from 'express-validator';
import { positiveIntegerParam, requiredText } from './validationHelpers.js';

const ingredientId = body('ingredient_id')
  .exists()
  .withMessage('Ingredient id is required')
  .bail()
  .isInt({ min: 1 })
  .withMessage('Ingredient id must be a valid positive integer')
  .toInt();

export const addPantryItemValidation = [ingredientId];

export const createPrivatePantryItemValidation = [
  requiredText('name', { label: 'Name', maxLength: 100 }),
];

export const removePantryItemValidation = [
  positiveIntegerParam('ingredientId', 'Ingredient id'),
];
