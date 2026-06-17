import {
  optionalRequiredText,
  optionalText,
  positiveIntegerParam,
  requiredText,
  requireAtLeastOneBodyField,
} from './validationHelpers.js';

const libraryFields = ['name', 'description'];
const libraryIdParam = positiveIntegerParam('id', 'Id');

// Create library validation rules
export const createLibraryValidation = [
  requiredText('name', { label: 'Name', maxLength: 100 }),

  optionalText('description', 'Description', 1000),
];

// Get single library validation rules
export const getSingleLibraryValidation = [libraryIdParam];

// Update library validation rules
export const updateLibraryValidation = [
  libraryIdParam,
  requireAtLeastOneBodyField(libraryFields),

  optionalRequiredText('name', { label: 'Name', maxLength: 100 }),

  optionalText('description', 'Description', 1000),
];

// Delete library validation rules
export const deleteLibraryValidation = [libraryIdParam];
