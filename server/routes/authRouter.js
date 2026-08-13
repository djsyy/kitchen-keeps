import express from 'express';
import { authenticateUser } from '../middleware/authentication.js';
import {
  registerValidation,
  loginValidation,
  updateUserValidation,
  updatePasswordValidation,
  deleteUserValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '../validations/authValidation.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  loginRateLimiter,
  passwordRecoveryEmailRateLimiter,
  passwordRecoveryRateLimiter,
  registrationRateLimiter,
} from '../middleware/rateLimiters.js';
import {
  register,
  login,
  logout,
  updateUser,
  updatePassword,
  forgotPassword,
  resetPassword,
  getUser,
  deleteUser,
} from '../controllers/authController.js';

const router = express.Router();

router.post(
  '/register',
  registrationRateLimiter,
  registerValidation,
  validateRequest,
  register
);
router.post(
  '/login',
  loginRateLimiter,
  loginValidation,
  validateRequest,
  login
);
router.post('/logout', logout);
router.patch(
  '/me',
  authenticateUser,
  updateUserValidation,
  validateRequest,
  updateUser
);
router.patch(
  '/password',
  authenticateUser,
  updatePasswordValidation,
  validateRequest,
  updatePassword
);
router.post(
  '/forgot-password',
  passwordRecoveryRateLimiter,
  forgotPasswordValidation,
  validateRequest,
  passwordRecoveryEmailRateLimiter,
  forgotPassword
);

router.post(
  '/reset-password',
  passwordRecoveryRateLimiter,
  resetPasswordValidation,
  validateRequest,
  resetPassword
);
router.get('/me', authenticateUser, getUser);
router.delete(
  '/me',
  authenticateUser,
  deleteUserValidation,
  validateRequest,
  deleteUser
);

export default router;
