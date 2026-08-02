import './config/env.js';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/authRouter.js';
import libraryRouter from './routes/libraryRouter.js';
import ingredientRouter from './routes/ingredientRouter.js';
import recipeRouter from './routes/recipeRouter.js';
import cookSessionRouter from './routes/cookSessionRouter.js';
import dashboardRouter from './routes/dashboardRouter.js';
import { authenticateUser } from './middleware/authentication.js';
import errorHandler from './middleware/errorHandler.js';
import { sessionMiddleware } from './middleware/session.js';

const app = express();
const port = Number(process.env.PORT || 3001);
const serverUrl = process.env.SERVER_URL || `http://localhost:${port}`;
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());
app.use(sessionMiddleware);

app.use('/api/auth', authRouter);
app.use('/api/libraries', authenticateUser, libraryRouter);
app.use('/api/ingredients', authenticateUser, ingredientRouter);
app.use('/api/recipes', authenticateUser, recipeRouter);
app.use('/api/cook-sessions', authenticateUser, cookSessionRouter);
app.use('/api/dashboard', authenticateUser, dashboardRouter);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on ${serverUrl}`);
});
