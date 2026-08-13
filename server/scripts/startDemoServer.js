import { demoDatabaseUrl } from './demoEnvironment.js';

if (process.env.NODE_ENV === 'test') {
  throw new Error('The demo server cannot run with NODE_ENV=test.');
}

process.env.NODE_ENV ??= 'development';
process.env.DATABASE_URL = demoDatabaseUrl;

await import('../index.js');
