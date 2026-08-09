import { body } from 'express-validator';
import {
  confirmRawMatchesField,
  optionalEmail,
  optionalRequiredText,
  requiredEmail,
  requiredPassword,
  requiredRawText,
  requiredText,
  requireAtLeastOneBodyField,
} from './validationHelpers.js';

const userProfileFields = ['name', 'email'];

// Register validation rules
export const registerValidation = [
  requiredText('name', { label: 'Name', maxLength: 100 }),
  requiredEmail('email'),
  requiredPassword('password', {
    requiredMessage: 'Password is required',
    typeMessage: 'Password must be a string',
    minLength: 8,
    lengthMessage: 'Password must be at least 8 characters',
  }),
  confirmRawMatchesField('confirmPassword', {
    targetField: 'password',
    requiredMessage: 'Password confirmation is required',
    typeMessage: 'Password confirmation must be a string',
    mismatchMessage: 'Passwords do not match',
  }),
];

// Login validation rules
export const loginValidation = [
  requiredEmail('email'),
  requiredRawText('password', {
    requiredMessage: 'Password is required',
    typeMessage: 'Password must be a string',
  }),
];

// Update user validation rules
export const updateUserValidation = [
  requireAtLeastOneBodyField(userProfileFields, {
    forbiddenFields: [
      {
        field: 'password',
        message: 'Password must be updated with the password endpoint',
      },
      {
        field: 'password_hash',
        message: 'Password hash cannot be updated directly',
      },
    ],
  }),

  optionalRequiredText('name', {
    label: 'Name',
    emptyMessage: 'Name is required',
    maxLength: 100,
  }),
  optionalEmail('email'),
];

// Update password validation rules
export const updatePasswordValidation = [
  requiredRawText('currentPassword', {
    requiredMessage: 'Current password is required',
    typeMessage: 'Current password must be a string',
  }),
  requiredPassword('newPassword', {
    requiredMessage: 'New password is required',
    typeMessage: 'New password must be a string',
    minLength: 8,
    lengthMessage: 'New password must be at least 8 characters',
  }),
  confirmRawMatchesField('confirmNewPassword', {
    targetField: 'newPassword',
    requiredMessage: 'New password confirmation is required',
    typeMessage: 'New password confirmation must be a string',
    mismatchMessage: 'New passwords do not match',
  }),
];

// Account deletion validation rules
export const deleteUserValidation = [
  requiredRawText('currentPassword', {
    requiredMessage: 'Current password is required',
    typeMessage: 'Current password must be a string',
  }),
  body('confirmation')
    .exists()
    .withMessage('Type DELETE to confirm account deletion')
    .bail()
    .isString()
    .withMessage('Deletion confirmation must be a string')
    .bail()
    .equals('DELETE')
    .withMessage('Type DELETE to confirm account deletion'),
];

// Forgot password validation rules
export const forgotPasswordValidation = [
  requiredEmail('email', {
    typeMessage: 'Email must be text',
    invalidMessage: 'Enter a valid email address',
  }),
];

// Reset password validation rules
export const resetPasswordValidation = [
  requiredRawText('token', {
    requiredMessage: 'Password reset token is required',
    typeMessage: 'Password reset token must be text',
  }),
  requiredPassword('newPassword', {
    requiredMessage: 'New password is required',
    typeMessage: 'New password must be text',
    minLength: 8,
    lengthMessage: 'New password must be at least 8 characters',
  }),
  confirmRawMatchesField('confirmNewPassword', {
    targetField: 'newPassword',
    requiredMessage: 'Please confirm your new password',
    typeMessage: 'New password confirmation must be text',
    mismatchMessage: 'New passwords do not match',
  }),
];
