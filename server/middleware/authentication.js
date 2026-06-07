import UnauthorizedError from '../errors/UnauthorizedError.js';

export const authenticateUser = (req, _res, next) => {
  if (!req.session?.userId) {
    return next(new UnauthorizedError('Not authenticated'));
  }

  req.user = {
    userId: req.session.userId,
  };

  next();
};
