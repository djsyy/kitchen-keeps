import { body } from 'express-validator';
import {
  optionalText,
  positiveIntegerParam,
  requireAtLeastOneBodyField,
} from './validationHelpers.js';

const libraryFields = ['name', 'description'];
const libraryIdParam = positiveIntegerParam('id', 'Id');

// Create library validation rules
export const createLibraryValidation = [
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

  optionalText('description', 'Description', 1000),
];

// Get single library validation rules
export const getSingleLibraryValidation = [libraryIdParam];

// Update library validation rules
export const updateLibraryValidation = [
  libraryIdParam,
  requireAtLeastOneBodyField(libraryFields),

  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Name must not be empty')
    .bail()
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters'),

  optionalText('description', 'Description', 1000),
];

// Delete library validation rules
export const deleteLibraryValidation = [libraryIdParam];
