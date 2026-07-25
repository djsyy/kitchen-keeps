import { readFile } from 'node:fs/promises';
import { pool } from '../config/db.js';

const seedPath = 'db/seed-data/global-ingredients.csv';
const isDryRun = process.argv.includes('--dry-run');
const csv = await readFile(seedPath, 'utf8');
const [header, ...rows] = csv.trim().split(/\r?\n/);

if (header !== 'name') {
  throw new Error(
    'The global ingredient seed CSV must have a single name column.'
  );
}

const namesByKey = new Map();

for (const row of rows) {
  const name = row.trim();
  const normalizedName = name.toLocaleLowerCase();

  if (!name || name.length > 100) {
    throw new Error(`Invalid global ingredient name: ${row}`);
  }

  if (/^[a-z]/.test(name)) {
    throw new Error(
      `Global ingredient names must start with a capital letter: ${name}`
    );
  }

  if (namesByKey.has(normalizedName)) {
    throw new Error(`Duplicate global ingredient name: ${name}`);
  }

  namesByKey.set(normalizedName, name);
}

if (isDryRun) {
  console.log(`Validated ${namesByKey.size} global ingredient names.`);
  await pool.end();
} else {
  try {
    const result = await pool.query(
      `
      INSERT INTO ingredients (name, created_by_user_id)
      SELECT unnest($1::text[]), NULL
      ON CONFLICT DO NOTHING
      RETURNING id
    `,
      [[...namesByKey.values()]]
    );

    console.log(
      `Seeded ${result.rowCount} global ingredients; ${namesByKey.size - result.rowCount} already existed.`
    );
  } finally {
    await pool.end();
  }
}
