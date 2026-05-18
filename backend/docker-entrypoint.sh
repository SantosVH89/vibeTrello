#!/bin/sh
# Este script se ejecuta al arrancar el contenedor backend.
# Su objetivo es esperar a que PostgreSQL acepte conexiones antes de aplicar
# la migracion SQL y el usuario admin inicial.

set -e

echo "Esperando a PostgreSQL..."

# Intentamos conectar varias veces porque la base de datos tarda unos segundos
# en estar lista aunque Docker ya haya iniciado el contenedor.
for intento in $(seq 1 30); do
  if node -e "import('pg').then(({default: pg}) => { const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT 1').then(() => pool.end()).then(() => process.exit(0)).catch(() => process.exit(1)); })"; then
    echo "PostgreSQL disponible."
    break
  fi

  if [ "$intento" = "30" ]; then
    echo "No se pudo conectar con PostgreSQL despues de varios intentos."
    exit 1
  fi

  sleep 2
done

echo "Aplicando migraciones..."
npm run db:migrate

echo "Aplicando seed inicial si hace falta..."
npm run db:seed

echo "Arrancando backend..."
exec "$@"

