# VibeTrello

Webapp local para gestionar proyectos, listas, tareas y subtareas con una experiencia tipo Trello.

## Stack

- Frontend: React + Vite + Tailwind CSS + dnd-kit.
- Backend: Node.js + Express.
- Base de datos: PostgreSQL con SQL directo mediante `pg`.
- Autenticacion: JWT + bcrypt.

## Estado actual

Esta primera base incluye:

- Migracion SQL inicial comentada.
- Seed de usuario admin de desarrollo.
- Backend Express con health, login, usuarios, tableros, listas, tareas, subtareas y auditoria.
- Frontend con login, cambio obligatorio de password, tableros, listas, tareas y drag & drop.
- Pantalla admin para crear usuarios con password temporal `12345678`.
- Dockerfiles y `docker-compose.yml` preparados para Dokploy.
- Scripts de preparacion y arranque para Windows 11 y Linux.

## Primeros pasos

1. Ejecuta `.\scripts\setup-windows.ps1` en Windows o `bash ./scripts/setup-linux.sh` en Linux.
2. Revisa `backend/.env` y ajusta `DATABASE_URL` si tu PostgreSQL usa otro usuario o password.
3. Crea la base de datos `VibeTrelloCodex` en PostgreSQL.

Despues:

1. Ejecuta `npm run db:migrate`.
2. Ejecuta `npm run db:seed`.
3. Ejecuta `.\scripts\dev-windows.ps1` o `bash ./scripts/dev-linux.sh`.

Acceso local recomendado:

- Frontend: `http://localhost:5175`
- Backend health: `http://localhost:4000/api/health`
- Usuario inicial: `admin@local.test`
- Password temporal: `12345678`

## Despliegue con Dokploy

El proyecto incluye despliegue Docker Compose para servidor:

- `docker-compose.yml`: PostgreSQL + backend + frontend.
- `.env.production.example`: variables que debes crear en Dokploy.
- `Analisis/guia_despliegue_dokploy.md`: guia no tecnica del flujo GitHub -> Dokploy.

En Dokploy, el dominio debe apuntar al servicio `frontend` y al puerto interno `80`.
