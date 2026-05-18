import { access, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

// Inserta datos minimos de desarrollo: el usuario Admin.
// Se usa despues de aplicar la migracion.
const carpetaActual = dirname(fileURLToPath(import.meta.url));
const carpetaBackend = join(carpetaActual, '..', '..');
const carpetaProyecto = join(carpetaBackend, '..');
const rutaSeedBackend = join(carpetaBackend, 'seed.sql');
const rutaSeedProyecto = join(carpetaProyecto, 'database', 'seed.sql');
const rutaSeed = await existe(rutaSeedBackend) ? rutaSeedBackend : rutaSeedProyecto;
const sql = await readFile(rutaSeed, 'utf8');

await pool.query(sql);
await pool.end();

console.log('Seed inicial aplicado correctamente.');

async function existe(ruta) {
  try {
    await access(ruta);
    return true;
  } catch {
    return false;
  }
}
