import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRouter from './routes/authRouter.js';
import libraryRouter from './routes/libraryRouter.js';
import ingredientRouter from './routes/ingredientRouter.js';
import recipeRouter from './routes/recipeRouter.js';
import cookSessionRouter from './routes/cookSessionRouter.js';
import dashboardRouter from './routes/dashboardRouter.js';
import pantryRouter from './routes/pantryRouter.js';
import { authenticateUser } from './middleware/authentication.js';
import errorHandler from './middleware/errorHandler.js';
import NotFoundError from './errors/NotFoundError.js';
import {
  createCorsOriginValidator,
  createOriginGuard,
  getAllowedOrigins,
} from './middleware/originGuard.js';
import { createGeneralApiRateLimiter } from './middleware/rateLimiters.js';
import { requestLogger } from './utils/logger.js';

export const createApp = ({ sessionMiddleware } = {}) => {
  const app = express();
  const allowedOrigins = getAllowedOrigins();
  const trustProxy = Number(process.env.TRUST_PROXY || 0);

  app.set('trust proxy', trustProxy);
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(requestLogger);

  app.use(
    cors({
      origin: createCorsOriginValidator(allowedOrigins),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
      optionsSuccessStatus: 204,
    })
  );

  app.use(createOriginGuard(allowedOrigins));
  app.use(express.json({ limit: '100kb' }));
  app.use('/api', createGeneralApiRateLimiter());

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  if (sessionMiddleware) {
    app.use(sessionMiddleware);
  }

  app.use('/api/auth', authRouter);
  app.use('/api/libraries', authenticateUser, libraryRouter);
  app.use('/api/ingredients', authenticateUser, ingredientRouter);
  app.use('/api/recipes', authenticateUser, recipeRouter);
  app.use('/api/cook-sessions', authenticateUser, cookSessionRouter);
  app.use('/api/dashboard', authenticateUser, dashboardRouter);
  app.use('/api/pantry', authenticateUser, pantryRouter);
  app.use('/api', (_req, _res, next) =>
    next(new NotFoundError('API route not found'))
  );
  app.use(errorHandler);

  return app;
};
