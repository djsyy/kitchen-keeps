import './env.js';
import pkg from 'pg';

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const query = (text, params = []) => pool.query(text, params);

// Gives a single connection for transactions that need multiple related queries
export const getClient = () => pool.connect();
