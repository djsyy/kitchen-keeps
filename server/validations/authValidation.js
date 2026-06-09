import { body } from 'express-validator';
import { requireAtLeastOneBodyField } from './validationHelpers.js';

const userProfileFields = ['name', 'email'];

// Register validation rules
export const registerValidation = [
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
    .isLength({ max: 100 })
    .withMessage(
      'Name must be at least 1 character and less than 100 characters'
    ),

  body('email')
    .exists()
    .withMessage('Email is required')
    .bail()
    .isString()
    .withMessage('Email must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Email must be a valid email')
    .bail()
    .toLowerCase(),

  body('password')
    .exists()
    .withMessage('Password is required')
    .bail()
    .isString()
    .withMessage('Password must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .bail()
    .isLength({ min: 4 })
    .withMessage('Password must be at least 4 characters'),

  body('confirmPassword')
    .exists()
    .withMessage('Password confirmation is required')
    .bail()
    .isString()
    .withMessage('Password confirmation must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Password confirmation is required')
    .bail()
    .custom((confirmPassword, { req }) => {
      if (confirmPassword !== req.body.password) {
        throw new Error('Passwords do not match');
      }

      return true;
    }),
];

// Login validation rules
export const loginValidation = [
  body('email')
    .exists()
    .withMessage('Email is required')
    .bail()
    .isString()
    .withMessage('Email must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Email must be a valid email')
    .bail()
    .toLowerCase(),

  body('password')
    .exists()
    .withMessage('Password is required')
    .bail()
    .isString()
    .withMessage('Password must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Password is required'),
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

  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .bail()
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters'),

  body('email')
    .optional()
    .isString()
    .withMessage('Email must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Email must be a valid email')
    .bail()
    .toLowerCase(),
];

// Update password validation rules
export const updatePasswordValidation = [
  body('currentPassword')
    .exists()
    .withMessage('Current password is required')
    .bail()
    .isString()
    .withMessage('Current password must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .exists()
    .withMessage('New password is required')
    .bail()
    .isString()
    .withMessage('New password must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('New password is required')
    .bail()
    .isLength({ min: 4 })
    .withMessage('New password must be at least 4 characters'),

  body('confirmNewPassword')
    .exists()
    .withMessage('New password confirmation is required')
    .bail()
    .isString()
    .withMessage('New password confirmation must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('New password confirmation is required')
    .bail()
    .custom((confirmNewPassword, { req }) => {
      if (confirmNewPassword !== req.body.newPassword) {
        throw new Error('New passwords do not match');
      }

      return true;
    }),
];
