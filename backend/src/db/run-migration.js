import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pool } from './pool.js';

// Lee la migracion SQL inicial y la ejecuta contra PostgreSQL.
// Se usa desde npm run db:migrate.
const rutaMigracion = join(process.cwd(), 'migrations', '001_init.sql');
const sql = await readFile(rutaMigracion, 'utf8');

await pool.query(sql);
await pool.end();

console.log('Migracion inicial aplicada correctamente.');

