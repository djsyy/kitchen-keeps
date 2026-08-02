import { body } from 'express-validator';
import {
  optionalRequiredText,
  positiveIntegerParam,
  requiredText,
  requireAtLeastOneBodyField,
} from './validationHelpers.js';

const recipeStepFields = ['instruction'];
const recipeIdParam = positiveIntegerParam('recipeId', 'Recipe id');
const recipeStepIdParam = positiveIntegerParam(
  'recipeStepId',
  'Recipe step id'
);

export const getRecipeStepsValidation = [recipeIdParam];

export const createRecipeStepValidation = [
  recipeIdParam,
  requiredText('instruction', { label: 'Instruction', maxLength: 5000 }),
];

export const updateRecipeStepValidation = [
  recipeIdParam,
  recipeStepIdParam,
  requireAtLeastOneBodyField(recipeStepFields, {
    forbiddenFields: [
      {
        field: 'sort_order',
        message: 'Use the reorder endpoint to update sort order',
      },
    ],
  }),
  optionalRequiredText('instruction', {
    label: 'Instruction',
    maxLength: 5000,
  }),
];

export const deleteRecipeStepValidation = [recipeIdParam, recipeStepIdParam];

export const reorderRecipeStepsValidation = [
  recipeIdParam,
  body('recipeStepIds')
    .exists()
    .withMessage('Recipe step ids are required')
    .bail()
    .isArray({ min: 1 })
    .withMessage('Recipe step ids must be a non-empty array')
    .bail()
    .custom((recipeStepIds) => {
      const normalizedIds = recipeStepIds.map((id) => Number(id));
      const recipeStepIdSet = new Set(normalizedIds);

      if (recipeStepIdSet.size !== recipeStepIds.length) {
        throw new Error('Duplicate recipe step ids are not allowed');
      }

      return true;
    }),
  body('recipeStepIds.*')
    .isInt({ min: 1 })
    .withMessage('Must be a valid positive integer')
    .bail()
    .toInt(),
];
