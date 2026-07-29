import express from 'express';
import {
  cancelCookSession,
  completeCookSession,
  createCookSession,
  getCookSession,
  getCookSessions,
  updateCookSessionItem,
} from '../controllers/cookSessionController.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  cancelCookSessionValidation,
  completeCookSessionValidation,
  createCookSessionValidation,
  getCookSessionValidation,
  getCookSessionsValidation,
  updateCookSessionItemValidation,
} from '../validations/cookSessionValidation.js';

export const recipeCookSessionRouter = express.Router({ mergeParams: true });

recipeCookSessionRouter.post(
  '/',
  createCookSessionValidation,
  validateRequest,
  createCookSession
);

const router = express.Router();

router
  .route('/')
  .get(getCookSessionsValidation, validateRequest, getCookSessions);

router.patch(
  '/:cookSessionId/items/:cookSessionItemId',
  updateCookSessionItemValidation,
  validateRequest,
  updateCookSessionItem
);

router.patch(
  '/:cookSessionId/complete',
  completeCookSessionValidation,
  validateRequest,
  completeCookSession
);

router.patch(
  '/:cookSessionId/cancel',
  cancelCookSessionValidation,
  validateRequest,
  cancelCookSession
);

router.get(
  '/:cookSessionId',
  getCookSessionValidation,
  validateRequest,
  getCookSession
);

export default router;
