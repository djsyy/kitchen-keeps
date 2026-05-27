import { body, param } from 'express-validator';

const recipeFields = [
  'title',
  'description',
  'image_url',
  'prep_time_minutes',
  'cook_time_minutes',
  'servings',
];

// Normalizes empty strings to null for DB consistency; otherwise returns the value
const normalizeOptionalText = (value) => {
  if (value === null) {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue === '' ? null : trimmedValue;
};

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

// Reusable validation rules for optional number fields
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

// Reusable validation rules for recipe id
const recipeIdParam = param('id')
  .trim()
  .notEmpty()
  .withMessage('Id is required')
  .bail()
  .isInt({ min: 1 })
  .withMessage('Must be a valid positive integer');

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
    .custom((value) => value === null || /^https?:\/\/\S+$/i.test(value)) // Makes sure the URL is proper URL format
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

  // Check to make sure at least one field is being updated
  body().custom((__, { req }) => {
    const hasRecipeField = recipeFields.some((field) =>
      Object.hasOwn(req.body, field)
    );

    if (!hasRecipeField) {
      throw new Error('At least one field is required');
    }

    return true;
  }),

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
    .custom((value) => value === null || /^https?:\/\/\S+$/i.test(value)) // Makes sure the URL is proper URL format
    .withMessage('Image URL must be a valid http or https URL'),
  optionalPositiveInteger('prep_time_minutes', 'Prep time'),
  optionalPositiveInteger('cook_time_minutes', 'Cook time'),
  optionalPositiveInteger('servings', 'Servings'),
];

// Delete recipe validation rules
export const deleteRecipeValidation = [recipeIdParam];
