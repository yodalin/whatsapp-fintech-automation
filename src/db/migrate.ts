import fs from 'fs';
import path from 'path';

import { PoolClient } from 'pg';
import { pool } from '../config/database';

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const ADVISORY_LOCK_KEY = 'whatsapp-fintech-automation:migrations';

function migrationsDir(): string {
  return MIGRATIONS_DIR;
}

async function ensureMetaTable(client: PoolClient): Promise<void> {
  await client.query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
    )`
  );
}

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();

  await client.query('SELECT pg_advisory_lock(hashtext($1))', [ADVISORY_LOCK_KEY]);
  console.log('[migrate] advisory lock acquired');

  try {
    await ensureMetaTable(client);

    const files = fs
      .readdirSync(migrationsDir())
      .filter((f) => f.endsWith('.sql'))
      .sort();

    const { rows } = await client.query<{ name: string }>('SELECT name FROM schema_migrations');
    const applied = new Set(rows.map((r) => r.name));

    if (files.length === 0) {
      console.log('[migrate] no migration files found');
      return;
    }

    let appliedNow = 0;
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`[migrate] already applied: ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir(), file), 'utf8');
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        appliedNow += 1;
        console.log(`[migrate] applied: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`[migrate] failed on ${file}:`, err instanceof Error ? err.message : err);
        throw err;
      }
    }

    console.log(`[migrate] complete. ${appliedNow} new migration(s) applied.`);
  } finally {
    await client.query('SELECT pg_advisory_unlock(hashtext($1))', [ADVISORY_LOCK_KEY]);
    client.release();
  }
}

if (require.main === module) {
  runMigrations()
    .then(async () => {
      await pool.end();
      console.log('✅ Migrations complete');
    })
    .catch(async (err) => {
      await pool.end();
      console.error('❌ Migration failed:', err instanceof Error ? err.message : err);
      process.exitCode = 1;
    });
}
