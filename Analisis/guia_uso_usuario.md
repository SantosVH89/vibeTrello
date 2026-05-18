# Guia de uso y mapa del proyecto VibeTrello

Esta guia explica la aplicacion y sus archivos con lenguaje de seguimiento, no como manual tecnico avanzado.

## Que hace la aplicacion

VibeTrello permite organizar trabajo en tableros. Cada tablero contiene listas, y cada lista contiene tareas. Las tareas pueden moverse entre listas con arrastrar y soltar. Cuando una lista es de tipo completado, las tareas que caen ahi pasan a estar completadas.

La aplicacion tambien guarda actividad en la tabla `activity_log`. Esto permite saber quien hizo una accion, sobre que elemento y en que momento.

## Flujo principal de uso

1. El usuario entra con email y password.
2. Si la password es temporal, la aplicacion obliga a cambiarla.
3. En la pantalla principal se crean y consultan tableros activos y completados.
4. Dentro de cada tablero se crean listas.
5. Dentro de cada lista se crean tareas.
6. Las tareas se pueden mover de lista con drag & drop.
7. Al abrir una tarea se ve su detalle, subtareas y actividad.

## Carpetas principales

### `backend`

Contiene el servidor Node.js + Express. Es la parte que recibe peticiones del frontend, valida permisos y habla con PostgreSQL.

Archivos importantes:

- `backend/src/server.js`: arranca el servidor en el puerto configurado.
- `backend/src/app.js`: conecta middlewares y rutas de la API.
- `backend/src/config.js`: lee variables de entorno como puerto, base de datos y secreto JWT.
- `backend/src/db/pool.js`: mantiene la conexion reutilizable con PostgreSQL.
- `backend/src/db/query.js`: ofrece consultas simples y transacciones.
- `backend/migrations/001_init.sql`: crea tablas, indices y comentarios de base de datos.

### `backend/src/routes`

Esta carpeta decide que URL llama a que controlador.

- `auth.routes.js`: login, usuario actual y cambio de password.
- `users.routes.js`: usuarios activos y administracion de usuarios.
- `boards.routes.js`: tableros y actividad de tablero.
- `lists.routes.js`: listas o columnas del tablero.
- `cards.routes.js`: tareas, movimiento y actividad de tarea.
- `subtasks.routes.js`: subtareas dentro de una tarea.

Si quieres cambiar una URL o añadir una nueva, esta carpeta es el primer sitio a revisar.

### `backend/src/controllers`

Los controladores leen datos de la peticion, validan lo minimo y llaman al servicio correspondiente.

Ejemplo: `boards.controller.js` recibe el nombre de un tablero y llama a `crearTablero`.

Si quieres cambiar mensajes de entrada o como se responde al frontend, mira aqui.

### `backend/src/services`

Los servicios contienen las reglas importantes del negocio.

- `auth.service.js`: comprueba password y genera JWT.
- `users.service.js`: crea, edita, activa, desactiva y resetea usuarios.
- `boards.service.js`: crea, edita, completa, reabre y elimina tableros.
- `lists.service.js`: crea listas, cambia tipo y reordena columnas.
- `cards.service.js`: crea tareas, las mueve, asigna, completa y elimina.
- `subtasks.service.js`: gestiona subtareas.
- `audit.service.js`: registra actividad.

Si quieres cambiar que pasa cuando se mueve una tarea o se completa un tablero, revisa esta carpeta.

### `backend/src/middlewares`

Son controles que se ejecutan antes o despues de las rutas.

- `auth.middleware.js`: verifica JWT, comprueba admin y bloquea usuarios con password temporal.
- `error.middleware.js`: convierte errores en respuestas JSON claras.

### `frontend`

Contiene la interfaz React que ve el usuario.

Archivos importantes:

- `frontend/src/main.jsx`: arranca React.
- `frontend/src/App.jsx`: define las pantallas principales.
- `frontend/src/index.css`: estilos base y Tailwind.
- `frontend/src/api/client.js`: todas las llamadas HTTP al backend.
- `frontend/src/context/AuthContext.jsx`: guarda sesion, login, logout y cambio de password.

### `frontend/src/pages`

Pantallas completas:

- `LoginPage.jsx`: entrada con email y password.
- `ChangePasswordPage.jsx`: cambio obligatorio de password temporal.
- `DashboardPage.jsx`: pantalla principal de tableros activos y completados.
- `BoardPage.jsx`: tablero con listas y tareas arrastrables.
- `AdminUsersPage.jsx`: pantalla de administracion donde el admin crea usuarios, activa/desactiva cuentas y restaura la password temporal `12345678`.

### `frontend/src/components`

Piezas reutilizables de UI:

- `AppShell.jsx`: cabecera comun y boton de salir.
- `BoardCard.jsx`: tarjeta visual de un tablero.
- `BoardColumn.jsx`: columna/lista dentro de un tablero.
- `TaskCard.jsx`: tarjeta/tarea arrastrable.
- `TaskFormModal.jsx`: ventana propia para crear tareas con descripcion y usuario asignado.
- `CardDetailModal.jsx`: detalle de tarea con subtareas y actividad.
- `FormMessage.jsx`: mensajes de error o aviso.

## Base de datos

Tablas principales:

- `users`: usuarios internos.
- `boards`: tableros o proyectos.
- `lists`: columnas de cada tablero.
- `cards`: tareas de cada lista.
- `subtasks`: subtareas dentro de una tarea.
- `activity_log`: auditoria de cambios importantes.

La migracion SQL incluye comentarios `COMMENT ON` para explicar tablas y columnas dentro de PostgreSQL.

## Posibles fallos comunes

### No conecta con PostgreSQL

Revisa `backend/.env`, especialmente `DATABASE_URL`. El usuario, password, puerto o nombre de base de datos pueden no coincidir con tu instalacion local. Para este proyecto el nombre previsto de la base de datos es `VibeTrelloCodex`.

### Login rechaza al admin inicial

Comprueba que se ejecutaron `npm run db:migrate` y `npm run db:seed`. El seed crea `admin@local.test`.

### El frontend muestra error de API

Comprueba que el backend esta activo en `http://localhost:4000/api/health` y que `frontend/.env.example` coincide con la URL real.

### Drag & drop no guarda el movimiento

Revisa `frontend/src/pages/BoardPage.jsx` para la accion visual y `backend/src/services/cards.service.js` para la persistencia en base de datos.

## Donde modificar cada cosa

- Cambiar colores o aspecto general: `frontend/tailwind.config.js` y `frontend/src/index.css`.
- Cambiar login o sesion: `frontend/src/context/AuthContext.jsx`, `backend/src/services/auth.service.js`.
- Cambiar permisos de admin: `backend/src/middlewares/auth.middleware.js`.
- Cambiar gestion visual de usuarios: `frontend/src/pages/AdminUsersPage.jsx`.
- Cambiar tablas o campos: `backend/migrations/001_init.sql`.
- Cambiar una consulta SQL de tareas: `backend/src/services/cards.service.js`.
- Cambiar creacion/asignacion visual de tareas: `frontend/src/components/TaskFormModal.jsx` y `frontend/src/components/CardDetailModal.jsx`.
- Cambiar el detalle de una tarea: `frontend/src/components/CardDetailModal.jsx`.
- Cambiar la pantalla de tablero: `frontend/src/pages/BoardPage.jsx`.
