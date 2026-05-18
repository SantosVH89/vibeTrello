# Requisitos del Proyecto — VibeTrello Local tipo Trello

> **Nombre provisional:** VibeTrello  
> **Tipo:** Webapp local de gestión de proyectos, tableros y tareas  
> **Inspiración funcional:** Trello  
> **Ejecución:** Local / servidor propio  
> **Frontend:** React + Vite · Tailwind CSS · dnd-kit  
> **Backend:** Node.js + Express  
> **Base de datos:** PostgreSQL  
> **Acceso a datos:** SQL puro con librería `pg` — sin ORM en v1  
> **Autenticación:** JWT + bcrypt  
> **Despliegue final:** Docker Compose · Dokploy + Traefik  
> **Norma de referencia:** ISO/IEC 25010

---

# 1. Objetivo del proyecto

Crear una webapp local para gestionar proyectos y tareas, inspirada en Trello, pero adaptada a un entorno interno.

La aplicación deberá permitir:

- Gestionar usuarios internos.
- Iniciar sesión con usuario y contraseña.
- Crear tableros/proyectos.
- Crear listas/columnas dentro de cada tablero.
- Crear tarjetas/tareas dentro de las listas.
- Mover tarjetas con drag & drop.
- Asignar tareas a usuarios.
- Crear subtareas dentro de una tarea.
- Asignar subtareas a usuarios.
- Marcar tareas como completadas o reabrirlas.
- Marcar tableros como completados o reabrirlos.
- Separar visualmente trabajo activo y trabajo completado.
- Registrar todos los cambios relevantes en base de datos a modo de auditoría.

La aplicación se desarrollará primero en local en Windows 11 y posteriormente se preparará para despliegue en servidor mediante Docker Compose y Dokploy.

---

# 2. Principios funcionales

La aplicación debe parecerse a Trello en su funcionamiento principal:

- Tableros.
- Columnas/listas.
- Tarjetas.
- Drag & drop.
- Detalle de tarjeta.
- Orden persistente de listas y tarjetas.
- Tareas asignables.
- Subtareas/checklist.
- Actividad/historial.

Pero se adaptará a estas reglas propias:

- No habrá registro público.
- Solo el admin podrá crear usuarios.
- Todos los usuarios podrán crear tableros, listas, tareas y subtareas.
- Todos los usuarios podrán mover tareas.
- Todos los usuarios podrán asignar tareas y subtareas.
- Las tareas podrán estar sin asignar.
- Los tableros se podrán marcar y desmarcar como completados.
- Las tareas cambiarán de estado según la columna/lista en la que se encuentren.
- Todo cambio importante quedará registrado en auditoría.

---

# 3. Stack tecnológico elegido

| Capa | Tecnología | Motivo |
|---|---|---|
| Frontend | React + Vite | Rápido de montar, ideal para una UI tipo Trello |
| Estilos | Tailwind CSS | Permite crear interfaces rápido y de forma ordenada |
| Drag & drop | dnd-kit | Librería moderna y flexible para mover tarjetas |
| Backend | Node.js + Express | Sencillo, mucha documentación y JSON nativo |
| Base de datos | PostgreSQL | Relacional, robusto y adecuado para auditoría |
| Acceso a BD | SQL directo con `pg` | Permite aprender SQL real antes de usar ORM |
| Auth | JWT + bcrypt | JWT para sesión y bcrypt para contraseñas |
| Desarrollo local | Windows 11 sin Docker inicialmente | Desarrollo más directo al principio |
| Despliegue final | Docker Compose | Permitirá levantar todo el proyecto de forma reproducible |
| Plataforma despliegue | Dokploy | Ya disponible en servidor local |
| Proxy | Traefik de Dokploy | Gestionará entrada HTTP/HTTPS hacia la app |

---

# 4. Roles y permisos

## 4.1 Rol `admin`

El rol admin podrá:

- Crear usuarios.
- Editar usuarios.
- Activar o desactivar usuarios.
- Resetear contraseña de usuarios.
- Ver usuarios del sistema.
- Crear tableros.
- Crear listas.
- Crear tareas.
- Crear subtareas.
- Mover tareas.
- Asignar tareas y subtareas.
- Marcar tareas como completadas.
- Reabrir tareas completadas.
- Marcar tableros como completados.
- Reabrir tableros completados.
- Consultar auditoría.

Regla principal:

> El admin es el único rol que puede crear usuarios.

---

## 4.2 Rol `usuario`

El rol usuario podrá:

- Iniciar sesión.
- Cambiar su propia contraseña si se requiere.
- Ver tableros.
- Crear tableros.
- Crear listas dentro de tableros.
- Crear tareas.
- Crear subtareas.
- Mover tareas entre columnas.
- Reordenar tareas.
- Asignar tareas a usuarios activos.
- Asignar subtareas a usuarios activos.
- Dejar tareas o subtareas sin asignar.
- Marcar tareas como completadas.
- Reabrir tareas completadas.
- Marcar tableros como completados.
- Reabrir tableros completados.
- Consultar actividad de una tarea.

---

# 5. Requisitos funcionales

## 5.1 Autenticación y usuarios

| ID | Requisito |
|---|---|
| RF-USR-01 | La aplicación no tendrá registro público de usuarios |
| RF-USR-02 | Solo el admin podrá crear usuarios |
| RF-USR-03 | Los usuarios tendrán nombre, email, contraseña, rol y estado |
| RF-USR-04 | El email será único |
| RF-USR-05 | La contraseña se guardará hasheada con bcrypt |
| RF-USR-06 | El admin podrá crear usuarios con contraseña temporal |
| RF-USR-07 | La contraseña temporal inicial recomendada será `12345678` solo para desarrollo/local |
| RF-USR-08 | Todo usuario creado con contraseña temporal deberá cambiarla en su primer inicio de sesión |
| RF-USR-09 | Un usuario con `must_change_password = true` no podrá usar la aplicación hasta cambiar la contraseña |
| RF-USR-10 | Un usuario inactivo no podrá iniciar sesión |
| RF-USR-11 | El backend devolverá un token JWT si las credenciales son correctas |
| RF-USR-12 | El frontend guardará el JWT de forma controlada y lo enviará en cada petición protegida |
| RF-USR-13 | El logout eliminará el token del navegador |
| RF-USR-14 | La API nunca devolverá `password_hash` |

### Decisión sobre JWT

Para el MVP se podrá usar `localStorage` para guardar el JWT.

En una versión posterior, si se quiere mejorar seguridad, se valorará usar cookie `HTTPOnly`, `Secure` y `SameSite`.

---

## 5.2 Tableros / proyectos

| ID | Requisito |
|---|---|
| RF-BOARD-01 | Todos los usuarios autenticados podrán crear tableros |
| RF-BOARD-02 | Un tablero tendrá nombre, descripción, usuario creador, estado, fechas y borrado lógico |
| RF-BOARD-03 | Los tableros podrán editarse |
| RF-BOARD-04 | Los tableros podrán eliminarse mediante borrado lógico |
| RF-BOARD-05 | Los tableros podrán marcarse como completados |
| RF-BOARD-06 | Los tableros completados podrán reabrirse |
| RF-BOARD-07 | Al marcar un tablero como completado se guardará `completed_at` |
| RF-BOARD-08 | Al reabrir un tablero se limpiará `completed_at` |
| RF-BOARD-09 | La pantalla principal separará tableros activos y tableros completados |
| RF-BOARD-10 | Marcar o reabrir un tablero generará auditoría |

### Estados de tablero

Un tablero podrá tener estos estados:

```text
active
completed
```

Un tablero completado no se elimina. Se muestra en una zona separada de completados.

---

## 5.3 Listas / columnas

Las listas representan columnas dentro de un tablero.

Ejemplo:

```text
Pendiente
En proceso
En revisión
Bloqueado
Completado
```

| ID | Requisito |
|---|---|
| RF-LIST-01 | Todos los usuarios podrán crear listas dentro de un tablero |
| RF-LIST-02 | Las listas podrán editarse |
| RF-LIST-03 | Las listas podrán reordenarse |
| RF-LIST-04 | Las listas podrán eliminarse mediante borrado lógico |
| RF-LIST-05 | Cada lista tendrá una posición dentro del tablero |
| RF-LIST-06 | Cada lista tendrá un tipo: `active` o `completed` |
| RF-LIST-07 | Las tareas dentro de una lista `completed` se considerarán completadas |
| RF-LIST-08 | Crear, editar, mover o eliminar una lista generará auditoría |

### Tipo de lista

```text
active      → tareas nuevas o en proceso
completed   → tareas finalizadas
```

La columna/lista será la que determine automáticamente el estado de la tarea.

---

## 5.4 Tareas / cards

| ID | Requisito |
|---|---|
| RF-CARD-01 | Todos los usuarios podrán crear tareas dentro de una lista |
| RF-CARD-02 | Una tarea tendrá título, descripción, tablero, lista, creador, asignado, estado, posición y fechas |
| RF-CARD-03 | Una tarea podrá estar sin asignar por defecto |
| RF-CARD-04 | El campo `assigned_to` podrá ser `null` |
| RF-CARD-05 | Todos los usuarios podrán asignar tareas a usuarios activos |
| RF-CARD-06 | Todos los usuarios podrán dejar una tarea sin asignar |
| RF-CARD-07 | Las tareas podrán editarse |
| RF-CARD-08 | Las tareas podrán moverse con drag & drop entre listas |
| RF-CARD-09 | Las tareas podrán reordenarse dentro de una misma lista |
| RF-CARD-10 | Las tareas podrán eliminarse mediante borrado lógico |
| RF-CARD-11 | Las tareas podrán marcarse manualmente como completadas |
| RF-CARD-12 | Las tareas completadas podrán reabrirse |
| RF-CARD-13 | Una tarea movida a una lista `completed` pasará automáticamente a estado `completed` |
| RF-CARD-14 | Una tarea movida desde una lista `completed` a una lista `active` pasará automáticamente a estado `active` |
| RF-CARD-15 | El orden de las tareas deberá persistir en base de datos |
| RF-CARD-16 | Al hacer clic en una tarea se abrirá su detalle |
| RF-CARD-17 | Crear, editar, mover, asignar, completar, reabrir o eliminar una tarea generará auditoría |

### Estados de tarea

```text
active
completed
```

### Detalle de tarea

El detalle de una tarea deberá mostrar:

- Título.
- Descripción.
- Tablero.
- Lista actual.
- Usuario creador.
- Usuario asignado.
- Estado.
- Subtareas.
- Progreso de subtareas.
- Historial de actividad.
- Fecha de creación.
- Fecha de actualización.
- Fecha de completado si aplica.

---

## 5.5 Subtareas

Las subtareas funcionan como una checklist avanzada dentro de una tarea.

| ID | Requisito |
|---|---|
| RF-SUB-01 | Dentro de cada tarea se podrán crear subtareas |
| RF-SUB-02 | Las subtareas podrán tener título y descripción |
| RF-SUB-03 | Las subtareas podrán asignarse a usuarios activos |
| RF-SUB-04 | Las subtareas podrán estar sin asignar por defecto |
| RF-SUB-05 | Las subtareas podrán marcarse como completadas |
| RF-SUB-06 | Las subtareas completadas podrán reabrirse |
| RF-SUB-07 | Las subtareas podrán reordenarse |
| RF-SUB-08 | Las subtareas podrán eliminarse mediante borrado lógico |
| RF-SUB-09 | La tarea mostrará progreso de subtareas, por ejemplo `2/5 completadas` |
| RF-SUB-10 | Crear, editar, asignar, completar, reabrir, mover o eliminar una subtarea generará auditoría |

### Estados de subtarea

```text
pending
completed
```

---

## 5.6 Vista activa y vista completada

La aplicación se visualizará como dos grandes zonas:

```text
Trabajo activo / en proceso
Trabajo completado
```

Esto aplicará principalmente a:

- Tableros.
- Tareas.

### Tableros

En la pantalla principal:

- Zona de tableros activos.
- Zona de tableros completados.

### Tareas

Dentro de un tablero se mantendrá el estilo Trello por columnas, pero las columnas de tipo `completed` marcarán qué tareas están finalizadas.

La app deberá destacar visualmente:

- Tareas activas.
- Tareas completadas.
- Listas de tipo completado.

---

## 5.7 Auditoría

La auditoría es una parte central del proyecto.

Cada acción relevante deberá registrar:

- Quién hizo la acción.
- Qué acción hizo.
- Sobre qué entidad.
- Valor anterior.
- Valor nuevo.
- Fecha y hora.

| ID | Requisito |
|---|---|
| RF-AUDIT-01 | La auditoría se guardará en base de datos |
| RF-AUDIT-02 | La auditoría no se podrá editar desde la aplicación |
| RF-AUDIT-03 | La auditoría no se podrá eliminar desde la aplicación |
| RF-AUDIT-04 | Se podrá consultar la auditoría desde el detalle de una tarea |
| RF-AUDIT-05 | Se podrá consultar la auditoría general de un tablero |
| RF-AUDIT-06 | Los campos `old_value` y `new_value` se guardarán como JSONB |
| RF-AUDIT-07 | Las operaciones críticas deberán guardar auditoría dentro de una transacción SQL |

### Acciones auditadas

#### Usuarios

- Usuario creado.
- Usuario editado.
- Usuario activado.
- Usuario desactivado.
- Contraseña reseteada.
- Cambio obligatorio de contraseña completado.

#### Tableros

- Tablero creado.
- Tablero editado.
- Tablero completado.
- Tablero reabierto.
- Tablero eliminado lógicamente.

#### Listas

- Lista creada.
- Lista editada.
- Lista reordenada.
- Lista eliminada lógicamente.
- Lista marcada como tipo `completed`.
- Lista marcada como tipo `active`.

#### Tareas

- Tarea creada.
- Tarea editada.
- Tarea asignada.
- Tarea desasignada.
- Tarea movida.
- Tarea reordenada.
- Tarea completada.
- Tarea reabierta.
- Tarea eliminada lógicamente.

#### Subtareas

- Subtarea creada.
- Subtarea editada.
- Subtarea asignada.
- Subtarea desasignada.
- Subtarea completada.
- Subtarea reabierta.
- Subtarea reordenada.
- Subtarea eliminada lógicamente.

---

# 6. APIs internas necesarias

La aplicación tendrá una API REST interna expuesta por el backend.

No se usarán APIs externas en el MVP.

Flujo:

```text
Frontend React
    ↓ HTTP/JSON
Backend Express API
    ↓ SQL
PostgreSQL
```

---

## 6.1 Auth

| Método | Endpoint | Descripción | Protegido |
|---|---|---|---|
| POST | `/api/auth/login` | Login y devolución de JWT | No |
| GET | `/api/auth/me` | Obtener usuario autenticado | Sí |
| POST | `/api/auth/change-password` | Cambiar contraseña propia | Sí |

No existirá endpoint público de registro.

---

## 6.2 Usuarios

| Método | Endpoint | Descripción | Rol |
|---|---|---|---|
| GET | `/api/users` | Listar usuarios activos para asignaciones | usuario/admin |
| GET | `/api/admin/users` | Listar todos los usuarios | admin |
| POST | `/api/admin/users` | Crear usuario | admin |
| PUT | `/api/admin/users/:id` | Editar usuario | admin |
| PATCH | `/api/admin/users/:id/activate` | Activar usuario | admin |
| PATCH | `/api/admin/users/:id/deactivate` | Desactivar usuario | admin |
| PATCH | `/api/admin/users/:id/reset-password` | Resetear contraseña | admin |

---

## 6.3 Tableros

| Método | Endpoint | Descripción | Protegido |
|---|---|---|---|
| GET | `/api/boards` | Listar tableros activos y completados | Sí |
| POST | `/api/boards` | Crear tablero | Sí |
| GET | `/api/boards/:id` | Ver tablero con listas y tareas | Sí |
| PUT | `/api/boards/:id` | Editar tablero | Sí |
| PATCH | `/api/boards/:id/complete` | Marcar tablero como completado | Sí |
| PATCH | `/api/boards/:id/reopen` | Reabrir tablero | Sí |
| DELETE | `/api/boards/:id` | Borrado lógico del tablero | Sí |

---

## 6.4 Listas

| Método | Endpoint | Descripción | Protegido |
|---|---|---|---|
| POST | `/api/boards/:boardId/lists` | Crear lista | Sí |
| PUT | `/api/lists/:id` | Editar lista | Sí |
| PATCH | `/api/boards/:boardId/lists/reorder` | Reordenar listas del tablero | Sí |
| PATCH | `/api/lists/:id/type` | Cambiar tipo active/completed | Sí |
| DELETE | `/api/lists/:id` | Borrado lógico de lista | Sí |

---

## 6.5 Tareas / cards

| Método | Endpoint | Descripción | Protegido |
|---|---|---|---|
| POST | `/api/lists/:listId/cards` | Crear tarea | Sí |
| GET | `/api/cards/:id` | Ver detalle de tarea | Sí |
| PUT | `/api/cards/:id` | Editar tarea | Sí |
| PATCH | `/api/cards/:id/move` | Mover tarea | Sí |
| PATCH | `/api/cards/:id/assign` | Asignar/desasignar tarea | Sí |
| PATCH | `/api/cards/:id/complete` | Completar tarea | Sí |
| PATCH | `/api/cards/:id/reopen` | Reabrir tarea | Sí |
| DELETE | `/api/cards/:id` | Borrado lógico de tarea | Sí |

Ejemplo de movimiento:

```json
{
  "target_list_id": 2,
  "target_position": 1
}
```

---

## 6.6 Subtareas

| Método | Endpoint | Descripción | Protegido |
|---|---|---|---|
| POST | `/api/cards/:cardId/subtasks` | Crear subtarea | Sí |
| PUT | `/api/subtasks/:id` | Editar subtarea | Sí |
| PATCH | `/api/subtasks/:id/assign` | Asignar/desasignar subtarea | Sí |
| PATCH | `/api/subtasks/:id/complete` | Completar subtarea | Sí |
| PATCH | `/api/subtasks/:id/reopen` | Reabrir subtarea | Sí |
| PATCH | `/api/cards/:cardId/subtasks/reorder` | Reordenar subtareas | Sí |
| DELETE | `/api/subtasks/:id` | Borrado lógico de subtarea | Sí |

---

## 6.7 Auditoría

| Método | Endpoint | Descripción | Protegido |
|---|---|---|---|
| GET | `/api/cards/:id/activity` | Ver actividad de una tarea | Sí |
| GET | `/api/boards/:id/activity` | Ver actividad de un tablero | Sí |

---

## 6.8 Salud del backend

| Método | Endpoint | Descripción | Protegido |
|---|---|---|---|
| GET | `/api/health` | Comprobar que el backend está vivo | No |

Respuesta esperada:

```json
{
  "status": "ok"
}
```

---

# 7. Modelo de datos

## 7.1 `users`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | serial PK | Identificador |
| `name` | varchar | Nombre visible |
| `email` | varchar unique | Email de login |
| `password_hash` | varchar | Hash bcrypt |
| `role` | varchar | `admin` / `user` |
| `is_active` | boolean | Si puede iniciar sesión |
| `must_change_password` | boolean | Obliga a cambiar contraseña |
| `created_at` | timestamp | Fecha de creación |
| `updated_at` | timestamp | Fecha de actualización |

---

## 7.2 `boards`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | serial PK | Identificador |
| `name` | varchar | Nombre del tablero |
| `description` | text | Opcional |
| `created_by` | FK → users | Creador |
| `status` | varchar | `active` / `completed` |
| `completed_at` | timestamp | Fecha de completado |
| `created_at` | timestamp | Fecha de creación |
| `updated_at` | timestamp | Fecha de actualización |
| `deleted_at` | timestamp | Borrado lógico |

---

## 7.3 `lists`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | serial PK | Identificador |
| `board_id` | FK → boards | Tablero |
| `name` | varchar | Nombre de columna |
| `position` | integer | Orden en tablero |
| `type` | varchar | `active` / `completed` |
| `created_at` | timestamp | Fecha de creación |
| `updated_at` | timestamp | Fecha de actualización |
| `deleted_at` | timestamp | Borrado lógico |

---

## 7.4 `cards`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | serial PK | Identificador |
| `board_id` | FK → boards | Tablero |
| `list_id` | FK → lists | Lista actual |
| `title` | varchar | Título |
| `description` | text | Opcional |
| `created_by` | FK → users | Usuario creador |
| `assigned_to` | FK → users nullable | Usuario asignado |
| `status` | varchar | `active` / `completed` |
| `position` | integer | Orden en lista |
| `completed_at` | timestamp | Fecha de completado |
| `created_at` | timestamp | Fecha de creación |
| `updated_at` | timestamp | Fecha de actualización |
| `deleted_at` | timestamp | Borrado lógico |

---

## 7.5 `subtasks`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | serial PK | Identificador |
| `card_id` | FK → cards | Tarea principal |
| `title` | varchar | Título |
| `description` | text | Opcional |
| `created_by` | FK → users | Usuario creador |
| `assigned_to` | FK → users nullable | Usuario asignado |
| `status` | varchar | `pending` / `completed` |
| `position` | integer | Orden dentro de la tarea |
| `completed_at` | timestamp | Fecha de completado |
| `created_at` | timestamp | Fecha de creación |
| `updated_at` | timestamp | Fecha de actualización |
| `deleted_at` | timestamp | Borrado lógico |

---

## 7.6 `activity_log`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | serial PK | Identificador |
| `user_id` | FK → users | Usuario que realiza la acción |
| `action` | varchar | Acción realizada |
| `entity_type` | varchar | `user`, `board`, `list`, `card`, `subtask` |
| `entity_id` | integer | ID de la entidad afectada |
| `board_id` | FK → boards nullable | Tablero relacionado |
| `card_id` | FK → cards nullable | Tarea relacionada |
| `old_value` | JSONB | Valor anterior |
| `new_value` | JSONB | Valor nuevo |
| `created_at` | timestamp | Fecha/hora |

---

# 8. Índices recomendados

| Tabla | Índice | Motivo |
|---|---|---|
| `users` | `email` | Login y unicidad |
| `users` | `role` | Filtros por rol |
| `users` | `is_active` | Filtros de usuarios activos |
| `boards` | `created_by` | Tableros por usuario |
| `boards` | `status` | Separar activos/completados |
| `boards` | `deleted_at` | Filtrar borrados |
| `lists` | `board_id` | Cargar listas de tablero |
| `lists` | `board_id, position` | Orden de listas |
| `lists` | `type` | Identificar listas completadas |
| `cards` | `board_id` | Cargar tareas de tablero |
| `cards` | `list_id` | Cargar tareas de lista |
| `cards` | `list_id, position` | Orden de tareas |
| `cards` | `assigned_to` | Tareas asignadas |
| `cards` | `status` | Tareas activas/completadas |
| `cards` | `deleted_at` | Filtrar borradas |
| `subtasks` | `card_id` | Subtareas de una tarea |
| `subtasks` | `assigned_to` | Subtareas asignadas |
| `subtasks` | `status` | Subtareas pendientes/completadas |
| `activity_log` | `entity_type, entity_id` | Historial de entidad |
| `activity_log` | `board_id` | Actividad de tablero |
| `activity_log` | `card_id` | Actividad de tarea |
| `activity_log` | `created_at` | Orden cronológico |

---

# 9. Requisitos no funcionales

Basados en ISO/IEC 25010.

## 9.1 Seguridad

| ID | Requisito |
|---|---|
| RNF-SEC-01 | Contraseñas hasheadas con bcrypt con salt rounds ≥ 10 |
| RNF-SEC-02 | Nunca guardar contraseñas en texto plano |
| RNF-SEC-03 | Rutas protegidas mediante JWT |
| RNF-SEC-04 | Variables sensibles en `.env`, nunca en código |
| RNF-SEC-05 | Validar permisos por rol |
| RNF-SEC-06 | Validar que el usuario está activo |
| RNF-SEC-07 | No devolver `password_hash` en respuestas |
| RNF-SEC-08 | Validar datos de entrada antes de consultar o modificar BD |
| RNF-SEC-09 | Auditoría de solo lectura desde la aplicación |

---

## 9.2 Fiabilidad

| ID | Requisito |
|---|---|
| RNF-FIA-01 | Usar transacciones SQL en operaciones críticas |
| RNF-FIA-02 | Si falla auditoría, no se confirma la acción |
| RNF-FIA-03 | Si falla la acción, no se registra auditoría |
| RNF-FIA-04 | Usar borrado lógico en usuarios, tableros, listas, tareas y subtareas donde aplique |
| RNF-FIA-05 | Persistir el orden de listas, tareas y subtareas |
| RNF-FIA-06 | PostgreSQL será la fuente de verdad |

---

## 9.3 Usabilidad

| ID | Requisito |
|---|---|
| RNF-USA-01 | Interfaz clara tipo Trello |
| RNF-USA-02 | Drag & drop visual y fluido |
| RNF-USA-03 | Diferenciar visualmente tareas activas y completadas |
| RNF-USA-04 | Diferenciar tableros activos y completados |
| RNF-USA-05 | Mostrar tareas sin asignar de forma clara |
| RNF-USA-06 | Mostrar usuario asignado en la tarjeta |
| RNF-USA-07 | Mostrar progreso de subtareas |
| RNF-USA-08 | Mensajes de error claros |
| RNF-USA-09 | Priorizar escritorio en el MVP |

---

## 9.4 Rendimiento

| ID | Requisito |
|---|---|
| RNF-PER-01 | Cargar tablero en menos de 2 segundos en entorno local |
| RNF-PER-02 | Mover tarjeta sin recargar la página |
| RNF-PER-03 | Consultas SQL simples e indexadas |
| RNF-PER-04 | Auditoría paginada |
| RNF-PER-05 | No cargar registros eliminados lógicamente salvo que sea necesario |

---

## 9.5 Mantenibilidad

| ID | Requisito |
|---|---|
| RNF-MAN-01 | Código separado por capas: frontend, backend y database |
| RNF-MAN-02 | Backend organizado en routes, controllers, services, db y middlewares |
| RNF-MAN-03 | SQL centralizado en capa db |
| RNF-MAN-04 | Migraciones SQL versionadas |
| RNF-MAN-05 | No usar ORM en v1 |
| RNF-MAN-06 | `.env.example` actualizado |
| RNF-MAN-07 | README con instrucciones de arranque |

---

## 9.6 Portabilidad

| ID | Requisito |
|---|---|
| RNF-POR-01 | Desarrollo inicial en Windows 11 sin Docker |
| RNF-POR-02 | Preparar Docker Compose en fase final |
| RNF-POR-03 | El proyecto deberá poder ejecutarse en servidor mediante Dokploy |
| RNF-POR-04 | Separar configuración local de configuración de despliegue |

---

## 9.7 Compatibilidad

| ID | Requisito |
|---|---|
| RNF-COM-01 | Compatible con Chrome, Edge y Firefox |
| RNF-COM-02 | API REST con JSON estándar |
| RNF-COM-03 | Frontend consumirá únicamente la API interna del backend |

---

# 10. Validaciones mínimas

El backend deberá validar:

- Email válido.
- Email único.
- Contraseña mínima de 8 caracteres.
- Nombre de usuario obligatorio.
- Rol válido: `admin` o `user`.
- Nombre de tablero obligatorio.
- Nombre de lista obligatorio.
- Tipo de lista válido: `active` o `completed`.
- Título de tarea obligatorio.
- Estado de tarea válido: `active` o `completed`.
- Estado de subtarea válido: `pending` o `completed`.
- IDs numéricos válidos.
- Posiciones válidas.
- Usuario asignado existente y activo.
- Que el usuario tenga permiso para ejecutar la operación.
- Que la entidad no esté eliminada lógicamente antes de modificarla.

---

# 11. Estructura de carpetas recomendada

```text
VibeTrello/
├── analisis/
│   └── requisitos.md
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── users.routes.js
│   │   │   ├── boards.routes.js
│   │   │   ├── lists.routes.js
│   │   │   ├── cards.routes.js
│   │   │   ├── subtasks.routes.js
│   │   │   └── audit.routes.js
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── db/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   └── app.js
│   ├── migrations/
│   │   └── 001_init.sql
│   ├── package.json
│   └── Dockerfile
├── database/
│   └── seed.sql
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── main.jsx
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env
├── .env.example
├── .gitignore
└── README.md
```

---

# 12. Fases recomendadas de desarrollo

## Fase 0 — Preparación

- Validar requisitos.
- Crear estructura de carpetas.
- Crear repositorio Git.
- Crear `.env.example`.
- Crear base de datos local PostgreSQL.
- Crear migración inicial `001_init.sql`.

## Fase 1 — Base de aplicación

- Backend Express funcionando.
- Endpoint `/api/health`.
- Conexión a PostgreSQL.
- Tabla `users`.
- Login JWT.
- Middleware de autenticación.
- Creación manual/seed de primer usuario admin.

## Fase 2 — Gestión de usuarios

- Admin crea usuarios.
- Admin edita usuarios.
- Admin activa/desactiva usuarios.
- Admin resetea contraseña.
- Usuario cambia contraseña obligatoria en primer acceso.
- Listado de usuarios activos para asignaciones.

## Fase 3 — Tableros y listas

- Crear tableros.
- Editar tableros.
- Marcar/desmarcar tableros completados.
- Crear listas.
- Editar listas.
- Reordenar listas.
- Definir listas como `active` o `completed`.

## Fase 4 — Tareas

- Crear tareas.
- Editar tareas.
- Asignar/desasignar tareas.
- Mover tareas con drag & drop.
- Reordenar tareas.
- Completar/reabrir tareas.
- Cambio automático de estado según lista.
- Detalle modal de tarea.

## Fase 5 — Subtareas

- Crear subtareas.
- Editar subtareas.
- Asignar/desasignar subtareas.
- Completar/reabrir subtareas.
- Reordenar subtareas.
- Mostrar progreso.

## Fase 6 — Auditoría

- Registrar actividad de usuarios.
- Registrar actividad de tableros.
- Registrar actividad de listas.
- Registrar actividad de tareas.
- Registrar actividad de subtareas.
- Ver actividad en detalle de tarea.
- Ver actividad general de tablero.

## Fase 7 — Preparación para despliegue

- Crear Dockerfile backend.
- Crear Dockerfile frontend.
- Crear docker-compose.yml.
- Probar ejecución completa.
- Subir a GitHub.
- Desplegar en Dokploy.
- Configurar variables de entorno en servidor.

---

# 13. Alcance del MVP v1

## Entra en MVP v1

- Login.
- Admin crea usuarios.
- Roles admin/user.
- Cambio obligatorio de contraseña temporal.
- Crear tableros.
- Editar tableros.
- Marcar/desmarcar tableros completados.
- Crear listas.
- Editar listas.
- Reordenar listas.
- Marcar listas como activas o completadas.
- Crear tareas.
- Editar tareas.
- Asignar/desasignar tareas.
- Mover tareas con drag & drop.
- Reordenar tareas.
- Completar/reabrir tareas.
- Cambio automático de estado según lista.
- Crear subtareas.
- Asignar/desasignar subtareas.
- Completar/reabrir subtareas.
- Progreso de subtareas.
- Auditoría de acciones principales.
- Vista de actividad en detalle de tarea.
- Borrado lógico.
- API REST interna.
- PostgreSQL local.
- Preparación para Docker/Dokploy al final.

## Fuera del MVP v1

- Registro público.
- Comentarios en tareas.
- Adjuntos.
- Etiquetas de colores.
- Fechas límite.
- Recordatorios.
- Notificaciones.
- WebSockets / tiempo real.
- Invitaciones por email.
- Workspaces.
- Plantillas de tablero.
- Automatizaciones tipo Butler.
- Integración con IA.
- ORM.
- App móvil.
- Permisos avanzados por tablero.

---

# 14. Criterios de aceptación

| ID | Criterio |
|---|---|
| CA-01 | Dado un admin autenticado, cuando cree un usuario, entonces el usuario queda guardado y puede iniciar sesión |
| CA-02 | Dado un usuario con contraseña temporal, cuando inicia sesión, entonces debe cambiar la contraseña antes de usar la app |
| CA-03 | Dado un usuario inactivo, cuando intenta iniciar sesión, entonces la app rechaza el acceso |
| CA-04 | Dado un usuario autenticado, cuando crea un tablero, entonces aparece en la zona de tableros activos |
| CA-05 | Dado un tablero activo, cuando se marca como completado, entonces aparece en la zona de tableros completados |
| CA-06 | Dado un tablero completado, cuando se reabre, entonces vuelve a la zona de tableros activos |
| CA-07 | Dado un tablero, cuando se crea una lista, entonces aparece como columna |
| CA-08 | Dada una lista, cuando se cambia su tipo a `completed`, entonces las tareas movidas a esa lista quedan completadas |
| CA-09 | Dada una lista, cuando se cambia su posición, entonces el orden persiste tras recargar |
| CA-10 | Dada una tarea nueva, cuando se crea sin asignación, entonces aparece como sin asignar |
| CA-11 | Dada una tarea, cuando se asigna a un usuario, entonces se muestra el usuario asignado |
| CA-12 | Dada una tarea, cuando se mueve a otra lista, entonces se actualiza su lista y posición |
| CA-13 | Dada una tarea, cuando se mueve a una lista `completed`, entonces cambia a estado `completed` y guarda `completed_at` |
| CA-14 | Dada una tarea completada, cuando se mueve a una lista `active`, entonces cambia a estado `active` y limpia `completed_at` |
| CA-15 | Dada una tarea, cuando se abre su detalle, entonces se ven sus datos, subtareas e historial |
| CA-16 | Dada una tarea, cuando se crea una subtarea, entonces aparece dentro de la tarea |
| CA-17 | Dada una subtarea, cuando se asigna a un usuario, entonces muestra el usuario asignado |
| CA-18 | Dada una subtarea, cuando se completa, entonces se actualiza el progreso de la tarea |
| CA-19 | Dado un cambio relevante, cuando se confirma, entonces se registra en `activity_log` |
| CA-20 | Dado un fallo en una operación crítica, cuando falla la acción o la auditoría, entonces se hace rollback |
| CA-21 | Dado un usuario normal, cuando intenta crear usuarios, entonces la API rechaza la operación |
| CA-22 | Dada una entidad borrada lógicamente, cuando se listan datos activos, entonces no aparece |

---

# 15. Datos iniciales recomendados

Para desarrollo local se recomienda crear un usuario admin inicial mediante `seed.sql`.

Ejemplo:

```text
Nombre: Admin
Email: admin@local.test
Contraseña temporal: 12345678
Rol: admin
must_change_password: true
is_active: true
```

La contraseña deberá guardarse hasheada en base de datos, nunca en texto plano.

---

# 16. Decisiones cerradas

| Decisión | Resultado |
|---|---|
| Registro público | No |
| Creación de usuarios | Solo admin |
| Roles iniciales | admin y user |
| Tareas sin asignar | Sí |
| Subtareas | Sí |
| Subtareas asignables | Sí |
| Tableros completables | Sí |
| Tableros reabribles | Sí |
| Estado de tarea según columna | Sí |
| Auditoría | Obligatoria |
| ORM | No en v1 |
| SQL directo | Sí |
| Desarrollo inicial con Docker | No |
| Docker para despliegue final | Sí |
| Despliegue final | Dokploy |

---

# 17. Checklist inicial

- [ ] Requisitos validados.
- [ ] Carpeta del proyecto creada.
- [ ] Repositorio Git inicializado.
- [ ] PostgreSQL local funcionando.
- [ ] Base de datos local creada.
- [ ] `.env.example` creado.
- [ ] Backend base creado.
- [ ] Frontend base creado.
- [ ] Migración inicial creada.
- [ ] Seed de admin inicial creado.
- [ ] Endpoint `/api/health` funcionando.
- [ ] Login funcionando.
- [ ] Primer tablero creado desde la app.

---

# 18. Nota final

Este documento define la versión inicial completa para empezar el desarrollo desde cero.

La prioridad será construir una aplicación funcional, clara y mantenible. No se añadirán funcionalidades secundarias hasta tener bien cerrados:

```text
usuarios
roles
tableros
listas
tareas
subtareas
asignaciones
completados
auditoría
```

Una vez esto funcione, se podrá valorar añadir comentarios, etiquetas, adjuntos, fechas límite, notificaciones o integración con IA.
