import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pool } from './pool.js';

// Ejecuta todas las migraciones SQL pendientes, en orden de nombre.
// La tabla schema_migrations permite saber que scripts ya se aplicaron.
// Asi un despliegue nuevo puede añadir cambios sin repetirlos cada vez que arranca Docker.
const carpetaMigraciones = join(process.cwd(), 'migrations');
const archivos = (await readdir(carpetaMigraciones))
  .filter((archivo) => archivo.endsWith('.sql'))
  .sort();

await pool.query(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    name VARCHAR(180) PRIMARY KEY,
    applied_at TIMESTAMP NOT NULL DEFAULT NOW()
  )
`);

for (const archivo of archivos) {
  const aplicada = await pool.query('SELECT 1 FROM schema_migrations WHERE name = $1', [archivo]);

  if (aplicada.rowCount > 0) {
    console.log(`Migracion ya aplicada: ${archivo}`);
    continue;
  }

  // Cada archivo explica su propio cambio. Aqui solo coordinamos el orden.
  const sql = await readFile(join(carpetaMigraciones, archivo), 'utf8');
  await pool.query(sql);
  await pool.query('INSERT INTO schema_migrations (name) VALUES ($1)', [archivo]);
  console.log(`Migracion aplicada: ${archivo}`);
}

await pool.end();

console.log('Migraciones revisadas correctamente.');
