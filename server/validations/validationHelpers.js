import { body, param } from 'express-validator';

export const MAX_POSTGRES_INTEGER = 2147483647;
export const BCRYPT_MAX_PASSWORD_BYTES = 72;

// Reusable validation rules for required text fields
export const requiredText = (
  field,
  {
    label,
    requiredMessage = `${label} is required`,
    typeMessage = `${label} must be a string`,
    lengthMessage,
    maxLength,
  }
) =>
  body(field)
    .exists()
    .withMessage(requiredMessage)
    .bail()
    .isString()
    .withMessage(typeMessage)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(requiredMessage)
    .bail()
    .isLength({ min: 1, max: maxLength })
    .withMessage(
      lengthMessage ||
        `${label} must be at least 1 character and less than ${maxLength} characters`
    );

// Reusable validation rules for optional text fields that cannot be empty when present
export const optionalRequiredText = (
  field,
  {
    label,
    typeMessage = `${label} must be a string`,
    emptyMessage = `${label} must not be empty`,
    maxLength,
    lengthMessage = `${label} must be less than ${maxLength} characters`,
  }
) =>
  body(field)
    .optional()
    .isString()
    .withMessage(typeMessage)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(emptyMessage)
    .bail()
    .isLength({ max: maxLength })
    .withMessage(lengthMessage);

// Reusable validation rules for required email fields
export const requiredEmail = (
  field,
  {
    requiredMessage = 'Email is required',
    typeMessage = 'Email must be a string',
    invalidMessage = 'Email must be a valid email',
    maxLength = 255,
    lengthMessage = `Email must be less than ${maxLength} characters`,
  } = {}
) =>
  body(field)
    .exists()
    .withMessage(requiredMessage)
    .bail()
    .isString()
    .withMessage(typeMessage)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(requiredMessage)
    .bail()
    .isLength({ max: maxLength })
    .withMessage(lengthMessage)
    .bail()
    .isEmail()
    .withMessage(invalidMessage)
    .bail()
    .toLowerCase();

// Reusable validation rules for optional email fields
export const optionalEmail = (
  field,
  {
    requiredMessage = 'Email is required',
    typeMessage = 'Email must be a string',
    invalidMessage = 'Email must be a valid email',
    maxLength = 255,
    lengthMessage = `Email must be less than ${maxLength} characters`,
  } = {}
) =>
  body(field)
    .optional()
    .isString()
    .withMessage(typeMessage)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(requiredMessage)
    .bail()
    .isLength({ max: maxLength })
    .withMessage(lengthMessage)
    .bail()
    .isEmail()
    .withMessage(invalidMessage)
    .bail()
    .toLowerCase();

// Reusable validation rules for required password fields
export const requiredPassword = (
  field,
  {
    requiredMessage,
    typeMessage,
    minLength,
    lengthMessage,
    maxByteLength = BCRYPT_MAX_PASSWORD_BYTES,
    byteLengthMessage = `Password must be ${maxByteLength} bytes or fewer`,
  }
) =>
  body(field)
    .exists()
    .withMessage(requiredMessage)
    .bail()
    .isString()
    .withMessage(typeMessage)
    .bail()
    .notEmpty()
    .withMessage(requiredMessage)
    .bail()
    .isLength({ min: minLength })
    .withMessage(lengthMessage)
    .bail()
    .isByteLength({ max: maxByteLength })
    .withMessage(byteLengthMessage);

// Required raw text is used for secrets where trimming would change the value.
export const requiredRawText = (field, { requiredMessage, typeMessage }) =>
  body(field)
    .exists()
    .withMessage(requiredMessage)
    .bail()
    .isString()
    .withMessage(typeMessage)
    .bail()
    .notEmpty()
    .withMessage(requiredMessage)
    .bail();

// Reusable validation rules for required text fields without length checks
export const requiredTextWithoutLength = (
  field,
  { requiredMessage, typeMessage }
) =>
  body(field)
    .exists()
    .withMessage(requiredMessage)
    .bail()
    .isString()
    .withMessage(typeMessage)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(requiredMessage);

// Reusable validation rules for confirmation fields that must match another body field
export const confirmMatchesField = (
  field,
  { targetField, requiredMessage, typeMessage, mismatchMessage }
) =>
  requiredTextWithoutLength(field, { requiredMessage, typeMessage }).custom(
    (value, { req }) => {
      if (value !== req.body[targetField]) {
        throw new Error(mismatchMessage);
      }

      return true;
    }
  );

// Password confirmations must compare the exact submitted value, including spaces.
export const confirmRawMatchesField = (
  field,
  { targetField, requiredMessage, typeMessage, mismatchMessage }
) =>
  requiredRawText(field, { requiredMessage, typeMessage }).custom(
    (value, { req }) => {
      if (value !== req.body[targetField]) {
        throw new Error(mismatchMessage);
      }

      return true;
    }
  );

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
export const optionalPositiveInteger = (
  field,
  label,
  { max = MAX_POSTGRES_INTEGER } = {}
) =>
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
    .custom((value) => value === null || Number(value) <= max)
    .withMessage(`${label} must be ${max} or less`)
    .bail()
    .customSanitizer((value) => (value === null ? null : Number(value)));

// Reusable validation rules for positive integer route params
export const positiveIntegerParam = (field, label) =>
  param(field)
    .trim()
    .notEmpty()
    .withMessage(`${label} is required`)
    .bail()
    .isInt({ min: 1, max: MAX_POSTGRES_INTEGER })
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
