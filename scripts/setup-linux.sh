#!/usr/bin/env bash
# Prepara dependencias npm en Linux, pensado para Oracle Linux 9.7.

set -e

echo "Instalando dependencias raiz, backend y frontend..."
npm run install:all

if [ ! -f "./backend/.env" ]; then
  cp "./backend/.env.example" "./backend/.env"
  echo "Creado backend/.env desde la plantilla."
fi

echo "Dependencias listas. Revisa backend/.env antes de migrar la base de datos."

