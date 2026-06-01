import { body, query } from 'express-validator';
import { positiveIntegerParam } from './validationHelpers.js';

const ingredientIdParam = positiveIntegerParam('id', 'Id');

// Create ingredient validation rules
export const createIngredientValidation = [
  body('name')
    .exists()
    .withMessage('Name is required')
    .bail()
    .isString()
    .withMessage('Name must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .bail()
    .isLength({ min: 1, max: 100 })
    .withMessage(
      'Name must be at least 1 character and less than 100 characters'
    ),
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

  body('name')
    .exists()
    .withMessage('Name is required')
    .bail()
    .isString()
    .withMessage('Name must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .bail()
    .isLength({ min: 1, max: 100 })
    .withMessage(
      'Name must be at least 1 character and less than 100 characters'
    ),
];

// Hide ingredient validation rules
export const hideIngredientValidation = [ingredientIdParam];

// Reactivate ingredient validation rules
export const reactivateIngredientValidation = [ingredientIdParam];
