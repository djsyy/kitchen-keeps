import './config/env.js';
import { sessionMiddleware } from './middleware/session.js';
import { createApp } from './app.js';
import { logCloudinaryConfigurationStatus } from './config/cloudinary.js';
import { pool } from './config/db.js';
import { createGracefulShutdownHandler } from './utils/gracefulShutdown.js';

const port = Number(process.env.PORT || 3001);
const serverUrl = process.env.SERVER_URL || `http://localhost:${port}`;
const app = createApp({ sessionMiddleware });

logCloudinaryConfigurationStatus();

const server = app.listen(port, () => {
  console.log(`Server listening on ${serverUrl}`);
});

const shutdown = createGracefulShutdownHandler({ server, pool });

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
