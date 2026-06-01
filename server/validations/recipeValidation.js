import { body } from 'express-validator';
import {
  optionalPositiveInteger,
  optionalText,
  positiveIntegerParam,
  requireAtLeastOneBodyField,
} from './validationHelpers.js';

const recipeFields = [
  'title',
  'description',
  'image_url',
  'prep_time_minutes',
  'cook_time_minutes',
  'servings',
];

const recipeIdParam = positiveIntegerParam('id', 'Id');

// Create recipe validation rules
export const createRecipeValidation = [
  body('title')
    .exists()
    .withMessage('Title is required')
    .bail()
    .isString()
    .withMessage('Title must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .bail()
    .isLength({ min: 1, max: 255 })
    .withMessage(
      'Title must be at least 1 character and less than 255 characters'
    ),

  optionalText('description', 'Description', 1000),
  optionalText('image_url', 'Image URL', 2048)
    // Makes sure the URL is proper URL format
    .custom((value) => value === null || /^https?:\/\/\S+$/i.test(value))
    .withMessage('Image URL must be a valid http or https URL'),
  optionalPositiveInteger('prep_time_minutes', 'Prep time'),
  optionalPositiveInteger('cook_time_minutes', 'Cook time'),
  optionalPositiveInteger('servings', 'Servings'),
];

// Get recipes validation rules
export const getRecipesValidation = [];

// Get single recipe validation rules
export const getSingleRecipeValidation = [recipeIdParam];

// Update recipe validation rules
export const updateRecipeValidation = [
  recipeIdParam,
  requireAtLeastOneBodyField(recipeFields),

  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Title must not be empty')
    .bail()
    .isLength({ max: 255 })
    .withMessage('Title must be less than 255 characters'),

  optionalText('description', 'Description', 1000),
  optionalText('image_url', 'Image URL', 2048)
    // Makes sure the URL is proper URL format
    .custom((value) => value === null || /^https?:\/\/\S+$/i.test(value))
    .withMessage('Image URL must be a valid http or https URL'),
  optionalPositiveInteger('prep_time_minutes', 'Prep time'),
  optionalPositiveInteger('cook_time_minutes', 'Cook time'),
  optionalPositiveInteger('servings', 'Servings'),
];

// Delete recipe validation rules
export const deleteRecipeValidation = [recipeIdParam];
