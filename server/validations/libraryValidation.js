import {
  optionalRequiredText,
  optionalText,
  positiveIntegerParam,
  requiredText,
  requireAtLeastOneBodyField,
} from './validationHelpers.js';
import { body } from 'express-validator';
import {
  libraryColorKeys,
  libraryIconKeys,
} from '../constants/libraryIcons.js';

const libraryFields = ['name', 'description', 'icon_key', 'color_key'];
const libraryIdParam = positiveIntegerParam('id', 'Id');

// Create library validation rules
export const createLibraryValidation = [
  requiredText('name', { label: 'Name', maxLength: 100 }),

  optionalText('description', 'Description', 1000),

  body('icon_key').optional().isIn(libraryIconKeys).withMessage('Invalid icon'),

  body('color_key')
    .optional()
    .isIn(libraryColorKeys)
    .withMessage('Invalid color'),
];

// Get single library validation rules
export const getSingleLibraryValidation = [libraryIdParam];

// Update library validation rules
export const updateLibraryValidation = [
  libraryIdParam,
  requireAtLeastOneBodyField(libraryFields),

  optionalRequiredText('name', { label: 'Name', maxLength: 100 }),

  optionalText('description', 'Description', 1000),

  body('icon_key').optional().isIn(libraryIconKeys).withMessage('Invalid icon'),

  body('color_key')
    .optional()
    .isIn(libraryColorKeys)
    .withMessage('Invalid color'),
];

// Delete library validation rules
export const deleteLibraryValidation = [libraryIdParam];
