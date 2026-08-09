import { body } from 'express-validator';
import {
  MAX_POSTGRES_INTEGER,
  optionalRequiredText,
  optionalPositiveInteger,
  optionalText,
  positiveIntegerParam,
  requiredText,
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
  optionalText('quantity_value', 'Quantity value', 50),
  optionalText('quantity_unit', 'Quantity unit', 50),
  optionalText('preparation_note', 'Preparation note', 100),
];

// Get recipe ingredients validation rules
export const getRecipeIngredientValidation = [recipeIdParam];

// Create recipe ingredient validation rules
export const createRecipeIngredientValidation = [
  recipeIdParam,

  body('sort_order')
    .not()
    .exists()
    .withMessage('New ingredients are appended automatically'),

  // Display name is required so the recipe line can be shown even without a linked ingredient
  requiredText('display_name', { label: 'Display name', maxLength: 255 }),

  ...recipeIngredientBodyValidation,
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

  optionalRequiredText('display_name', {
    label: 'Display name',
    maxLength: 255,
  }),

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
    .isInt({ min: 1, max: MAX_POSTGRES_INTEGER })
    .withMessage('Must be a valid positive integer')
    .bail()
    .toInt(),
];

// Delete recipe ingredient validation rules
export const deleteRecipeIngredientValidation = [
  recipeIdParam,
  recipeIngredientIdParam,
];
