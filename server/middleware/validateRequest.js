import { validationResult } from 'express-validator';
import BadRequestError from '../errors/BadRequestError.js';

export default function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return next(
      new BadRequestError(
        'Please check your information and try again.',
        formattedErrors
      )
    );
  }

  next();
}
