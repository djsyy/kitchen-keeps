import express from 'express';
import {
  addPantryItem,
  createPrivatePantryItem,
  getPantry,
  removePantryItem,
} from '../controllers/pantryController.js';
import validateRequest from '../middleware/validateRequest.js';
import {
  addPantryItemValidation,
  createPrivatePantryItemValidation,
  removePantryItemValidation,
} from '../validations/pantryValidation.js';

const router = express.Router();

router
  .route('/')
  .get(getPantry)
  .post(addPantryItemValidation, validateRequest, addPantryItem);

router.post(
  '/private-ingredient',
  createPrivatePantryItemValidation,
  validateRequest,
  createPrivatePantryItem
);

router.delete(
  '/:ingredientId',
  removePantryItemValidation,
  validateRequest,
  removePantryItem
);

export default router;
