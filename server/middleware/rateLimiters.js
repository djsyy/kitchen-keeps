import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import { logSecurityEvent } from '../utils/logger.js';

export const createRateLimiter = ({ windowMs, limit, keyGenerator, scope }) =>
  rateLimit({
    windowMs,
    limit,
    keyGenerator,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res, _next, options) => {
      logSecurityEvent('security.rate_limited', req, { scope });
      const resetTime = req.rateLimit?.resetTime;

      if (resetTime instanceof Date) {
        const retryAfterSeconds = Math.max(
          1,
          Math.ceil((resetTime.getTime() - Date.now()) / 1000)
        );
        res.setHeader('Retry-After', retryAfterSeconds);
      }

      res.status(options.statusCode).json({
        message: 'Too many requests. Please try again later.',
        errors: [],
        requestId: req.requestId,
      });
    },
  });

export const createGeneralApiRateLimiter = () =>
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    scope: 'api',
  });

export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  scope: 'auth.login',
});

export const registrationRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  scope: 'auth.register',
});

export const passwordRecoveryRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  scope: 'auth.password_recovery',
});

export const imageUploadRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  scope: 'uploads.image',
  keyGenerator: (req) =>
    req.user?.userId
      ? `user:${req.user.userId}`
      : `ip:${ipKeyGenerator(req.ip)}`,
});
