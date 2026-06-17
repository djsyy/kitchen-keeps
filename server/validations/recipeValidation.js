import {
  optionalRequiredText,
  optionalPositiveInteger,
  optionalText,
  positiveIntegerParam,
  requiredText,
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
  requiredText('title', { label: 'Title', maxLength: 255 }),

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

  optionalRequiredText('title', { label: 'Title', maxLength: 255 }),

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
