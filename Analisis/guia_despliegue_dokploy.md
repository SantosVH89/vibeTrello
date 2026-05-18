# Guia de despliegue con GitHub y Dokploy

Esta guia explica como publicar VibeTrello en un servidor Oracle Linux 9.7 con Docker y Dokploy.

## Objetivo

El flujo recomendado sera:

1. Trabajar en local.
2. Subir cambios a GitHub con `git push`.
3. Dokploy detecta el push.
4. Dokploy reconstruye los contenedores.
5. La web queda actualizada en el servidor.

## Archivos que participan

- `docker-compose.yml`: define los contenedores de PostgreSQL, backend y frontend.
- `backend/Dockerfile`: construye la imagen del backend Express.
- `backend/docker-entrypoint.sh`: espera a PostgreSQL, aplica migraciones y crea el admin inicial si no existe.
- `frontend/Dockerfile`: compila React/Vite y sirve la web con Nginx.
- `frontend/nginx.conf`: sirve el frontend y redirige `/api` al backend.
- `.env.production.example`: plantilla de variables para Dokploy.

## Como funciona la red interna

El usuario entra por el dominio publico configurado en Dokploy. Ese dominio apunta al contenedor `frontend`.

El frontend sirve React y, cuando React llama a `/api`, Nginx redirige esa peticion al contenedor `backend`.

El backend se conecta a PostgreSQL usando el nombre interno `postgres`.

## Variables importantes

- `APP_URL`: dominio publico final, por ejemplo `https://vibetrello.midominio.com`.
- `POSTGRES_DB`: nombre de la base de datos. En este proyecto: `VibeTrelloCodex`.
- `POSTGRES_USER`: usuario interno de PostgreSQL.
- `POSTGRES_PASSWORD`: password fuerte de PostgreSQL.
- `JWT_SECRET`: secreto largo para firmar sesiones.
- `TEMPORARY_PASSWORD`: password temporal para usuarios creados por admin.

## Auto Deploy en Dokploy

Segun la documentacion actual de Dokploy, los proyectos Docker Compose pueden usar Auto Deploy. Con GitHub, Dokploy puede redesplegar automaticamente cuando se hace push al repositorio.

En Dokploy hay que crear un proyecto Docker Compose desde GitHub, activar Auto Deploy y configurar el dominio apuntando al servicio `frontend` en el puerto interno `80`.

## Primer arranque

En el primer despliegue, el backend ejecuta:

1. Migracion SQL inicial.
2. Seed del usuario admin si aun no existe.
3. Arranque de Express.

El usuario inicial sera:

```text
Email: admin@local.test
Password temporal: 12345678
```

Al entrar por primera vez, la aplicacion pedira cambiar esa password.

