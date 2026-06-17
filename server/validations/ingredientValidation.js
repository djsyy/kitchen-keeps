import { query } from 'express-validator';
import { positiveIntegerParam, requiredText } from './validationHelpers.js';

const ingredientIdParam = positiveIntegerParam('id', 'Id');

// Create ingredient validation rules
export const createIngredientValidation = [
  requiredText('name', { label: 'Name', maxLength: 100 }),
];

// Get ingredients validation rules
export const getIngredientsValidation = [
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string')
    .bail()
    .trim()
    .bail()
    .isLength({ max: 255 })
    .withMessage('Search must be less than 255 characters'),
];

// Get single ingredient validation rules
export const getSingleIngredientValidation = [ingredientIdParam];

// Update ingredient validation rules
export const updateIngredientValidation = [
  ingredientIdParam,

  requiredText('name', { label: 'Name', maxLength: 100 }),
];

// Hide ingredient validation rules
export const hideIngredientValidation = [ingredientIdParam];

// Reactivate ingredient validation rules
export const reactivateIngredientValidation = [ingredientIdParam];
