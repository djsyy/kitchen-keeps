import express from 'express';
import { authenticateUser } from '../middleware/authentication.js';
import {
  registerValidation,
  loginValidation,
  updateUserValidation,
  updatePasswordValidation,
} from '../validations/authValidation.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  register,
  login,
  logout,
  updateUser,
  updatePassword,
  getUser,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
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
router.get('/me', authenticateUser, getUser);

export default router;
