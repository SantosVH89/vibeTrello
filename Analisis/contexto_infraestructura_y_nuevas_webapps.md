# Contexto de infraestructura y guia para nuevas webapps

Este documento resume como esta montada actualmente la infraestructura de VibeTrello y que hay que tener en cuenta al crear nuevas webapps en el mismo servidor.

La idea es que sirva como memoria tecnica y no tecnica: si dentro de unos meses se empieza otra aplicacion, este documento explica de donde partimos.

## 1. Servidor actual

Servidor:

```text
servibecoding
```

Sistema:

```text
Oracle Linux 9.7
```

Contenedores:

```text
Docker
Docker Compose
Coolify
Traefik
PostgreSQL
```

Panel de Coolify:

```text
http://servibecoding:8000
```

Webapp VibeTrello:

```text
http://servibecoding/vibeTrello
```

No usamos `http://servibecoding` a pelo para la app porque queremos dejar el dominio base libre para publicar mas aplicaciones debajo de rutas propias.

Ejemplos futuros:

```text
http://servibecoding/vibeTrello
http://servibecoding/inventario
http://servibecoding/crm
http://servibecoding/otraApp
```

## 2. Estado actual de proxies

Antes se intento desplegar con Dokploy. Dokploy dejo un Traefik propio ocupando los puertos 80 y 443.

Para Coolify se paro ese proxy:

```bash
docker stop dokploy-traefik
```

Ahora quien debe ocupar los puertos publicos es el proxy de Coolify:

```text
coolify-proxy
```

Puertos esperados:

```text
80:80
443:443
8080:8080
```

El proxy de Coolify usa Traefik y lee etiquetas del `docker-compose.yml` para saber que contenedor debe responder a cada ruta.

## 3. Proxy corporativo para Docker y Coolify

El servidor necesita proxy para salir a Internet desde contenedores.

Proxy actual:

```text
http://172.16.0.2:8081
```

Se configuro Docker para que los contenedores nuevos hereden el proxy en:

```text
/root/.docker/config.json
```

Contenido esperado:

```json
{
  "proxies": {
    "default": {
      "httpProxy": "http://172.16.0.2:8081",
      "httpsProxy": "http://172.16.0.2:8081",
      "noProxy": "localhost,127.0.0.1,::1,*.local,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16,postgres,backend,frontend,coolify,coolify-db,coolify-redis"
    }
  }
}
```

Esto fue necesario porque Coolify crea contenedores temporales para clonar GitHub y construir la app. Si esos contenedores no tienen proxy, aparecen errores como:

```text
Failed to connect to github.com port 443
Failed to read Git source
fatal: early EOF
```

Comprobacion rapida:

```bash
docker run --rm curlimages/curl:8.10.1 -I https://github.com
```

Debe verse algo parecido a:

```text
HTTP/1.1 200 Connection established
HTTP/2 200
```

## 4. GitHub y despliegue automatico

Repositorio actual:

```text
https://github.com/SantosVH89/vibeTrello.git
```

Rama usada:

```text
main
```

En Coolify, el recurso de VibeTrello debe usar:

```text
Build Pack: Docker Compose
Base Directory: /
Docker Compose Location: /docker-compose.yml
Branch: main
Commit SHA: vacio, salvo que se quiera fijar un commit concreto
```

Cada vez que se haga push a GitHub, Coolify puede redesplegar la aplicacion si el autodeploy esta activo.

Si el autodeploy no salta, se puede usar manualmente:

```text
Reload Compose File
Redeploy
```

## 5. Estructura Docker de VibeTrello

Archivo activo:

```text
docker-compose.yml
```

Archivo antiguo conservado para referencia:

```text
vDockploy.yml
```

Servicios actuales:

```text
postgres
backend
frontend
```

### postgres

Base de datos PostgreSQL 16.

Usa volumen persistente:

```text
postgres_data
```

Este volumen conserva los datos aunque se reconstruyan los contenedores.

### backend

API Node.js + Express.

Puerto interno:

```text
4000
```

No se publica directamente al host. El frontend/Nginx reenvia la API internamente.

### frontend

React compilado servido por Nginx.

Puerto interno:

```text
80
```

Es el servicio publico que recibe trafico desde Traefik.

## 6. Ruta publica actual

VibeTrello no cuelga de `/`, sino de:

```text
/vibeTrello
```

Por eso en el `docker-compose.yml` se usan estos argumentos de build:

```yaml
VITE_BASE_PATH: /vibeTrello/
VITE_API_URL: /vibeTrello/api
```

Significado:

- `VITE_BASE_PATH`: indica a Vite y React Router que la app vive dentro de `/vibeTrello/`.
- `VITE_API_URL`: indica al frontend que las llamadas a la API deben ir a `/vibeTrello/api`.

Nginx recibe `/vibeTrello/api` y lo reenvia al backend como `/api`.

## 7. Traefik en VibeTrello

El `frontend` tiene etiquetas manuales para que Traefik sepa enrutar la app:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.vibetrello-frontend-http.entrypoints=http"
  - "traefik.http.routers.vibetrello-frontend-http.rule=Host(`servibecoding`) && PathPrefix(`/vibeTrello`)"
  - "traefik.http.routers.vibetrello-frontend-http.service=vibetrello-frontend"
  - "traefik.http.services.vibetrello-frontend.loadbalancer.server.port=80"
```

Puntos importantes:

- El router se llama `vibetrello-frontend-http`.
- El servicio Traefik se llama `vibetrello-frontend`.
- Estos nombres deben ser unicos por aplicacion.
- La regla usa `Host(servibecoding)` y `PathPrefix(/vibeTrello)`.

Para otra webapp hay que cambiar nombres y path.

Ejemplo para una app llamada Inventario:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.inventario-frontend-http.entrypoints=http"
  - "traefik.http.routers.inventario-frontend-http.rule=Host(`servibecoding`) && PathPrefix(`/inventario`)"
  - "traefik.http.routers.inventario-frontend-http.service=inventario-frontend"
  - "traefik.http.services.inventario-frontend.loadbalancer.server.port=80"
```

## 8. Variables de entorno de VibeTrello en Coolify

Variables de produccion:

```env
POSTGRES_DB=VibeTrelloCodex
POSTGRES_USER=vibetrello
POSTGRES_PASSWORD=password_larga_privada
JWT_SECRET=secreto_jwt_largo_privado
JWT_EXPIRES_IN=8h
TEMPORARY_PASSWORD=12345678
APP_URL=http://servibecoding
```

Notas:

- `POSTGRES_PASSWORD` debe tener valor. Si queda vacia, PostgreSQL puede fallar o quedar unhealthy.
- `JWT_SECRET` debe ser largo y privado.
- `TEMPORARY_PASSWORD` es la password inicial para usuarios creados por admin.
- `APP_URL` se usa para CORS.

En este despliegue, las rutas Traefik se controlan desde el `docker-compose.yml`. Por eso no conviene duplicar dominios en campos de Coolify si eso provoca que Coolify genere rutas extra al backend.

## 9. Stack usado en VibeTrello

Frontend:

```text
React
Vite
Tailwind CSS
React Router
dnd-kit
lucide-react
Nginx
```

Backend:

```text
Node.js
Express
PostgreSQL
pg
JWT
bcryptjs
cors
dotenv
morgan
```

Infraestructura:

```text
Docker
Docker Compose
Coolify
Traefik
GitHub
```

## 10. Seguridad actual de VibeTrello

Login:

- Autenticacion con JWT.
- Passwords guardadas como hash bcrypt.
- Usuarios internos creados por admin.
- Roles `admin` y `user`.
- Usuarios inactivos no pueden entrar.
- Cambio obligatorio de password temporal con `must_change_password`.

SQL:

- Se usa SQL directo con `pg`.
- Las consultas usan parametros `$1`, `$2`, etc.
- Esto protege frente a inyeccion SQL si se mantiene esta practica.

Pendiente recomendable para endurecer seguridad:

- HTTPS real si se publica fuera de red interna.
- Limite de intentos de login.
- Bloqueo temporal tras muchos fallos.
- `helmet` para cabeceras HTTP.
- Cookies httpOnly para JWT si se quiere mejorar frente a XSS.
- Copias de seguridad automaticas de PostgreSQL.

## 11. Base de datos actual

Base de datos:

```text
VibeTrelloCodex
```

Tablas:

```text
users
boards
lists
cards
card_assignees
subtasks
activity_log
schema_migrations
```

### users

Usuarios internos.

Columnas:

```text
id
name
email
password_hash
role
is_active
must_change_password
created_at
updated_at
```

### boards

Tableros o proyectos.

Columnas:

```text
id
name
description
created_by
status
completed_at
created_at
updated_at
deleted_at
```

### lists

Listas o columnas dentro de un tablero.

Columnas:

```text
id
board_id
name
position
type
created_at
updated_at
deleted_at
```

### cards

Tareas principales.

Columnas:

```text
id
board_id
list_id
title
description
created_by
assigned_to
status
position
completed_at
created_at
updated_at
deleted_at
```

`assigned_to` se mantiene como primer responsable por compatibilidad.

### card_assignees

Asignaciones multiples de usuarios a tareas.

Columnas:

```text
card_id
user_id
position
created_at
```

### subtasks

Subtareas dentro de una tarea.

Columnas:

```text
id
card_id
title
description
created_by
assigned_to
status
position
completed_at
created_at
updated_at
deleted_at
```

### activity_log

Auditoria de acciones importantes.

Columnas:

```text
id
user_id
action
entity_type
entity_id
board_id
card_id
old_value
new_value
created_at
```

### schema_migrations

Control de migraciones ya aplicadas.

Columnas:

```text
name
applied_at
```

## 12. Checklist para crear una nueva webapp

Antes de programar:

```text
1. Elegir nombre de app.
2. Elegir ruta publica unica, por ejemplo /inventario.
3. Elegir nombre de BD unico.
4. Elegir usuario de BD unico.
5. Elegir JWT_SECRET propio.
6. Crear repo GitHub propio.
```

En frontend:

```text
1. Configurar Vite con base dinamica.
2. Configurar React Router con basename.
3. Configurar VITE_API_URL con el prefijo publico.
```

En Nginx:

```text
1. Servir la app desde su carpeta publica.
2. Redirigir /nombreApp a /nombreApp/.
3. Reenviar /nombreApp/api al backend interno.
```

En Docker Compose:

```text
1. Usar expose, no ports, salvo casos muy concretos.
2. Publicar solo el frontend por Traefik.
3. No publicar PostgreSQL al host.
4. Usar nombres Traefik unicos.
5. Usar PathPrefix unico.
6. Usar volumen de BD propio.
```

En Coolify:

```text
1. Crear recurso Docker Compose.
2. Repository: URL de GitHub.
3. Branch: main.
4. Base Directory: /
5. Docker Compose Location: /docker-compose.yml.
6. Crear variables de entorno.
7. Reload Compose File.
8. Deploy.
```

Despues del deploy:

```bash
docker ps
curl -I -H "Host: servibecoding" http://127.0.0.1/rutaApp
```

## 13. Errores conocidos y como reconocerlos

### GitHub no carga en Coolify

Sintoma:

```text
Failed to read Git source
Failed to connect to github.com port 443
```

Probable causa:

```text
El contenedor temporal de Coolify no tiene proxy.
```

Revisar:

```bash
cat /root/.docker/config.json
docker run --rm curlimages/curl:8.10.1 -I https://github.com
```

### PostgreSQL unhealthy

Sintoma:

```text
dependency failed to start: container postgres is unhealthy
```

Probables causas:

```text
POSTGRES_PASSWORD vacia
Variables de entorno no guardadas
Volumen viejo incompatible
```

### 404 page not found en navegador

Sintoma:

```text
404 page not found
```

Probable causa:

```text
Traefik no tiene ruta para ese Host + PathPrefix.
```

Revisar etiquetas Traefik del frontend:

```bash
docker inspect nombre_contenedor_frontend --format '{{json .Config.Labels}}'
```

### Responde JSON del backend en vez de cargar React

Sintoma:

```json
{"message":"Ruta no encontrada"}
```

Probable causa:

```text
La ruta publica apunta al backend en vez de al frontend.
```

## 14. Reglas practicas para no romper otras apps

- No usar `/` para una app concreta si el servidor tendra varias apps.
- No repetir `PathPrefix`.
- No repetir nombres de routers Traefik.
- No publicar varios servicios al mismo puerto host.
- No reutilizar la misma base de datos salvo que sea intencionado.
- No compartir `JWT_SECRET` entre apps.
- No subir `.env` con secretos reales a GitHub.
- Documentar cada nueva app en un archivo parecido a este.

