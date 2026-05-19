import { body, param, query } from 'express-validator';

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
export const getSingleIngredientValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Id is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('Must be a valid positive integer'),
];
