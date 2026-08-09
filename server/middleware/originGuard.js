import ForbiddenError from '../errors/ForbiddenError.js';

const unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const getAllowedOrigins = () =>
  (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

export const isAllowedOrigin = (origin, allowedOrigins) =>
  allowedOrigins.includes(origin);

export const createCorsOriginValidator =
  (allowedOrigins) => (origin, callback) => {
    if (!origin || isAllowedOrigin(origin, allowedOrigins)) {
      return callback(null, true);
    }

    return callback(new ForbiddenError('Request origin is not allowed'));
  };

export const createOriginGuard = (allowedOrigins) => (req, _res, next) => {
  if (!unsafeMethods.has(req.method)) {
    return next();
  }

  const origin = req.get('Origin');

  if (!origin && process.env.NODE_ENV !== 'production') {
    return next();
  }

  if (origin && isAllowedOrigin(origin, allowedOrigins)) {
    return next();
  }

  return next(new ForbiddenError('Request origin is not allowed'));
};
