import './env.js';
import pkg from 'pg';

const { Pool } = pkg;
const isTestEnvironment = process.env.NODE_ENV === 'test';
const connectionString = isTestEnvironment
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL;

if (isTestEnvironment) {
  if (!connectionString) {
    throw new Error('TEST_DATABASE_URL is required when NODE_ENV is test');
  }

  let databaseName;
  try {
    databaseName = decodeURIComponent(new URL(connectionString).pathname).slice(
      1
    );
  } catch {
    throw new Error(
      'TEST_DATABASE_URL must be a valid PostgreSQL connection URL'
    );
  }

  if (!databaseName.endsWith('_test')) {
    throw new Error('TEST_DATABASE_URL must target a database ending in _test');
  }
}

export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const query = (text, params = []) => pool.query(text, params);

// Gives a single connection for transactions that need multiple related queries
export const getClient = () => pool.connect();
