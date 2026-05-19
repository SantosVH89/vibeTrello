# Guia de despliegue con Coolify

Esta guia explica como desplegar VibeTrello en Coolify usando Docker Compose.

## Archivo principal

Coolify debe leer este archivo:

```text
docker-compose.yml
```

El compose anterior de Dokploy se conserva como:

```text
vDockploy.yml
```

## Servicios

El compose define tres servicios:

- `postgres`: base de datos PostgreSQL.
- `backend`: API Node.js + Express.
- `frontend`: Nginx con React compilado y proxy interno hacia `/api`.

## Variables que debes crear en Coolify

En la seccion Environment de Coolify crea estas variables:

```env
APP_URL=https://tu-dominio-o-subdominio
POSTGRES_DB=VibeTrelloCodex
POSTGRES_USER=vibetrello
POSTGRES_PASSWORD=una-password-larga
JWT_SECRET=un-secreto-jwt-largo-y-privado
JWT_EXPIRES_IN=8h
TEMPORARY_PASSWORD=12345678
```

## Dominio

En Coolify asigna el dominio al servicio:

```text
frontend
```

Puerto interno:

```text
80
```

No apuntes el dominio al backend. El frontend ya reenvia `/api` al backend internamente.

## Primer arranque

Al arrancar, el backend:

1. Espera a que PostgreSQL este disponible.
2. Aplica la migracion SQL inicial.
3. Aplica el seed del administrador inicial si no existe.
4. Arranca Express.

Usuario inicial:

```text
Email: admin@local.test
Password temporal: 12345678
```

