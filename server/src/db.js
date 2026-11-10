import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const here = path.dirname(fileURLToPath(import.meta.url));

export async function makeDb() {
  let pool;
  if (process.env.USE_PGMEM === '1') {
    const { newDb } = await import('pg-mem');
    const mem = newDb();
    const { Pool } = mem.adapters.createPg();
    pool = new Pool();
  } else {
    const pg = (await import('pg')).default;
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
  }
  await pool.query(fs.readFileSync(path.join(here, 'schema.sql'), 'utf8'));
  return pool;
}
