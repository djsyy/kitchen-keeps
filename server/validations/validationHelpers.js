import { body, param } from 'express-validator';

// Normalizes empty strings to null for DB consistency; otherwise returns the value
const normalizeOptionalText = (value) => {
  if (value === null) {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue === '' ? null : trimmedValue;
};

// Reusable validation rules for optional text fields
export const optionalText = (field, label, maxLength) =>
  body(field)
    .optional()
    // Allows optional text fields to be sent as null or a string
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
    // Enforces the field-specific max length after empty strings become null
    .custom((value) => value === null || value.length <= maxLength)
    .withMessage(`${label} must be less than ${maxLength} characters`);

// Reusable validation rules for optional positive integer fields
export const optionalPositiveInteger = (field, label) =>
  body(field)
    .optional()
    .customSanitizer((value) => {
      if (value === null || value === '') {
        return null;
      }

      return value;
    })
    // Accepts numeric strings or numbers only when they represent whole numbers
    .custom(
      (value) =>
        value === null ||
        ((typeof value === 'string' || typeof value === 'number') &&
          Number.isInteger(Number(value)))
    )
    .withMessage(`${label} must be a whole number or null`)
    .bail()
    // Requires present numeric values to be positive
    .custom((value) => value === null || Number(value) > 0)
    .withMessage(`${label} must be greater than 0`)
    .bail()
    .customSanitizer((value) => (value === null ? null : Number(value)));

// Reusable validation rules for positive integer route params
export const positiveIntegerParam = (field, label) =>
  param(field)
    .trim()
    .notEmpty()
    .withMessage(`${label} is required`)
    .bail()
    .isInt({ min: 1 })
    .withMessage('Must be a valid positive integer');

// Checks that a PATCH body includes at least one allowed field
export const requireAtLeastOneBodyField = (
  fields,
  { forbiddenFields = [] } = {}
) =>
  body().custom((__, { req }) => {
    // Rejects fields that must use a dedicated endpoint instead of PATCH
    const forbiddenField = forbiddenFields.find(({ field }) =>
      Object.hasOwn(req.body, field)
    );

    if (forbiddenField) {
      throw new Error(forbiddenField.message);
    }

    // Confirms the request updates at least one supported field
    const hasAllowedField = fields.some((field) =>
      Object.hasOwn(req.body, field)
    );

    if (!hasAllowedField) {
      throw new Error('At least one field is required');
    }

    return true;
  });
