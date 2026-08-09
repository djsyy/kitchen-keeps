import { StatusCodes } from 'http-status-codes';
import CustomError from './CustomError.js';

export default class ForbiddenError extends CustomError {
  constructor(message = 'Request origin is not allowed') {
    super(message, StatusCodes.FORBIDDEN);
  }
}
