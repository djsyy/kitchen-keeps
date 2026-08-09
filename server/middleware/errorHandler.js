import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors/CustomError.js';
import ForbiddenError from '../errors/ForbiddenError.js';
import { logError, logSecurityEvent } from '../utils/logger.js';

export default function errorHandler(err, req, res, _next) {
  const isBodyTooLarge = err.type === 'entity.too.large';
  const isKnownError = err instanceof CustomError || isBodyTooLarge;
  const statusCode = isBodyTooLarge
    ? StatusCodes.REQUEST_TOO_LONG
    : isKnownError
      ? err.statusCode
      : StatusCodes.INTERNAL_SERVER_ERROR;
  const message = isBodyTooLarge
    ? 'Request body is too large'
    : isKnownError
      ? err.message
      : 'Something went wrong. Please try again later.';

  if (err instanceof ForbiddenError) {
    logSecurityEvent('security.origin_rejected', req, {
      origin: req.get('Origin') || null,
    });
  }

  if (statusCode >= StatusCodes.INTERNAL_SERVER_ERROR) {
    logError('server.request_error', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl.split('?')[0],
      ip: req.ip,
      userId: req.user?.userId ?? null,
      errorName: err.name,
      errorMessage: err.message,
      errorStack: err.stack,
    });
  }

  return res.status(statusCode).json({
    message,
    errors: isKnownError && Array.isArray(err.errors) ? err.errors : [],
    requestId: req.requestId,
  });
}
