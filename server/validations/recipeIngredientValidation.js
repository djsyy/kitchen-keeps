import { body } from 'express-validator';
import {
  optionalPositiveInteger,
  optionalText,
  positiveIntegerParam,
  requireAtLeastOneBodyField,
} from './validationHelpers.js';

const recipeIngredientFields = [
  'ingredient_id',
  'quantity_value',
  'quantity_unit',
  'preparation_note',
  'display_name',
];

const recipeIdParam = positiveIntegerParam('recipeId', 'Recipe id');
const recipeIngredientIdParam = positiveIntegerParam(
  'recipeIngredientId',
  'Recipe ingredient id'
);

const recipeIngredientBodyValidation = [
  optionalPositiveInteger('ingredient_id', 'Ingredient id'),
  optionalText('quantity_value', 'Quantity value', 100),
  optionalText('quantity_unit', 'Quantity unit', 50),
  optionalText('preparation_note', 'Preparation note', 255),
];

const createRecipeIngredientBodyValidation = [
  ...recipeIngredientBodyValidation,
  optionalPositiveInteger('sort_order', 'Sort order'),
];

// Get recipe ingredients validation rules
export const getRecipeIngredientValidation = [recipeIdParam];

// Create recipe ingredient validation rules
export const createRecipeIngredientValidation = [
  recipeIdParam,

  // Display name is required so the recipe line can be shown even without a linked ingredient
  body('display_name')
    .exists()
    .withMessage('Display name is required')
    .bail()
    .isString()
    .withMessage('Display name must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Display name is required')
    .bail()
    .isLength({ min: 1, max: 255 })
    .withMessage(
      'Display name must be at least 1 character and less than 255 characters'
    ),

  ...createRecipeIngredientBodyValidation,
];

// Update recipe ingredient validation rules
export const updateRecipeIngredientValidation = [
  recipeIdParam,
  recipeIngredientIdParam,
  requireAtLeastOneBodyField(recipeIngredientFields, {
    forbiddenFields: [
      {
        field: 'sort_order',
        message: 'Use the reorder endpoint to update sort order',
      },
    ],
  }),

  body('display_name')
    .optional()
    .isString()
    .withMessage('Display name must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Display name must not be empty')
    .bail()
    .isLength({ max: 255 })
    .withMessage('Display name must be less than 255 characters'),

  ...recipeIngredientBodyValidation,
];

// Reorder recipe ingredients validation rules
export const reorderRecipeIngredientsValidation = [
  recipeIdParam,

  body('recipeIngredientIds')
    .exists()
    .withMessage('Recipe ingredient ids are required')
    .bail()
    .isArray({ min: 1 })
    .withMessage('Recipe ingredient ids must be a non-empty array')
    .bail()
    // Ensures the full reorder list does not include duplicate ids
    .custom((recipeIngredientIds) => {
      const normalizedIds = recipeIngredientIds.map((id) => Number(id));
      const recipeIngredientIdSet = new Set(normalizedIds);

      if (recipeIngredientIdSet.size !== recipeIngredientIds.length) {
        throw new Error('Duplicate recipe ingredient ids are not allowed');
      }

      return true;
    }),

  body('recipeIngredientIds.*')
    .isInt({ min: 1 })
    .withMessage('Must be a valid positive integer')
    .bail()
    .toInt(),
];

// Delete recipe ingredient validation rules
export const deleteRecipeIngredientValidation = [
  recipeIdParam,
  recipeIngredientIdParam,
];
