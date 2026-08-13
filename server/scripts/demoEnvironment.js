import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({
  path: fileURLToPath(new URL('../../.env.demo', import.meta.url)),
});

export const demoDatabaseUrl = process.env.DEMO_DATABASE_URL;

if (!demoDatabaseUrl) {
  throw new Error('DEMO_DATABASE_URL is required for demo data commands.');
}

let demoDatabaseName;
try {
  demoDatabaseName = decodeURIComponent(
    new URL(demoDatabaseUrl).pathname
  ).slice(1);
} catch {
  throw new Error(
    'DEMO_DATABASE_URL must be a valid PostgreSQL connection URL.'
  );
}

if (
  !demoDatabaseName.endsWith('_demo') &&
  !demoDatabaseName.endsWith('_test')
) {
  throw new Error(
    'DEMO_DATABASE_URL must target a database ending in _demo or _test.'
  );
}

export { demoDatabaseName };
