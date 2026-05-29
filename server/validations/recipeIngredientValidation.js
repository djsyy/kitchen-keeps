import { body, param } from 'express-validator';

const recipeIngredientFields = [
  'ingredient_id',
  'quantity_value',
  'quantity_unit',
  'preparation_note',
  'display_name',
];

// Normalizes empty strings to null for DB consistency; otherwise returns the value
const normalizeOptionalText = (value) => {
  if (value === null) {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue === '' ? null : trimmedValue;
};

// Reusable validation rules for recipe ingredient ids
const positiveIntegerParam = (field, label) =>
  param(field)
    .trim()
    .notEmpty()
    .withMessage(`${label} is required`)
    .bail()
    .isInt({ min: 1 })
    .withMessage('Must be a valid positive integer');

// Reusable validation rules for optional text fields
const optionalText = (field, label, maxLength) =>
  body(field)
    .optional()
    .custom((value) => value === null || typeof value === 'string')
    .withMessage(`${label} must be a string or null`)
    .bail()
    .customSanitizer((value) => {
      if (value === null) {
        return null;
      }

      if (typeof value !== 'string') {
        return value;
      }

      return normalizeOptionalText(value);
    })
    .custom((value) => value === null || value.length <= maxLength)
    .withMessage(`${label} must be less than ${maxLength} characters`);

// Reusable validation rules for optional positive integer fields
const optionalPositiveInteger = (field, label) =>
  body(field)
    .optional()
    .customSanitizer((value) => {
      if (value === null || value === '') {
        return null;
      }

      return value;
    })
    .custom(
      (value) =>
        value === null ||
        ((typeof value === 'string' || typeof value === 'number') &&
          Number.isInteger(Number(value)))
    )
    .withMessage(`${label} must be a whole number or null`)
    .bail()
    .custom((value) => value === null || Number(value) > 0)
    .withMessage(`${label} must be greater than 0`)
    .bail()
    .customSanitizer((value) => (value === null ? null : Number(value)));

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

  // Check to make sure at least one field is being updated
  body().custom((__, { req }) => {
    if (Object.hasOwn(req.body, 'sort_order')) {
      throw new Error('Use the reorder endpoint to update sort order');
    }

    const hasRecipeIngredientField = recipeIngredientFields.some((field) =>
      Object.hasOwn(req.body, field)
    );

    if (!hasRecipeIngredientField) {
      throw new Error('At least one field is required');
    }

    return true;
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
