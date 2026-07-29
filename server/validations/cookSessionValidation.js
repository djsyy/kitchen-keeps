import { body, query } from 'express-validator';
import { positiveIntegerParam } from './validationHelpers.js';

const cookSessionStatuses = ['active', 'completed', 'cancelled'];
const cookSessionItemStatuses = ['unknown', 'have', 'need'];
const recipeIdParam = positiveIntegerParam('recipeId', 'Recipe id');
const cookSessionIdParam = positiveIntegerParam(
  'cookSessionId',
  'Cook session id'
);
const cookSessionItemIdParam = positiveIntegerParam(
  'cookSessionItemId',
  'Cook session item id'
);

export const createCookSessionValidation = [recipeIdParam];

export const getCookSessionsValidation = [
  query('status')
    .optional()
    .isIn(cookSessionStatuses)
    .withMessage('Invalid cook session status'),
];

export const getCookSessionValidation = [cookSessionIdParam];

export const updateCookSessionItemValidation = [
  cookSessionIdParam,
  cookSessionItemIdParam,
  body('status')
    .exists()
    .withMessage('Status is required')
    .bail()
    .isString()
    .withMessage('Status must be a string')
    .bail()
    .isIn(cookSessionItemStatuses)
    .withMessage('Invalid cook session item status'),
];

export const completeCookSessionValidation = [cookSessionIdParam];

export const cancelCookSessionValidation = [cookSessionIdParam];
