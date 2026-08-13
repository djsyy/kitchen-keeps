import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({
  path: fileURLToPath(new URL('../../.env.migrations', import.meta.url)),
});

if (!process.env.MIGRATION_DATABASE_URL) {
  throw new Error(
    'MIGRATION_DATABASE_URL is required to seed global ingredients in production.'
  );
}

// The shared seed script uses config/db.js. Set its runtime connection before
// loading it so this command remains isolated to the migration-only URL.
process.env.DATABASE_URL = process.env.MIGRATION_DATABASE_URL;

await import('./seedGlobalIngredients.js');
