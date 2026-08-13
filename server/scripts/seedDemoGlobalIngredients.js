import { demoDatabaseUrl } from './demoEnvironment.js';

process.env.DATABASE_URL = demoDatabaseUrl;

await import('./seedGlobalIngredients.js');
