-- ============================================================
-- Migracion inicial de VibeTrello
-- ============================================================
-- Este SQL crea las tablas principales de la aplicacion.
-- Las tablas usan nombres en ingles porque los requisitos ya las
-- definen asi y porque los endpoints de la API tambien siguen esa forma.
-- Los comentarios explican cada pieza en castellano para que una persona
-- no tecnica pueda seguir el flujo de datos.

BEGIN;

-- La extension citext permite comparar emails sin distinguir mayusculas.
-- Ejemplo: Admin@Local.test y admin@local.test se tratan como el mismo email.
CREATE EXTENSION IF NOT EXISTS citext;

-- Usuarios internos. No hay registro publico: los crea el administrador.
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email CITEXT NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  must_change_password BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Usuarios internos que pueden iniciar sesion en VibeTrello.';
COMMENT ON COLUMN users.password_hash IS 'Password protegida con bcrypt. Nunca se guarda el texto original.';
COMMENT ON COLUMN users.must_change_password IS 'Si es true, el usuario debe cambiar la password temporal antes de usar la app.';

-- Tableros o proyectos. El borrado es logico usando deleted_at.
CREATE TABLE IF NOT EXISTS boards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP
);

COMMENT ON TABLE boards IS 'Tableros de trabajo. Un tablero completado sigue existiendo y se muestra aparte.';
COMMENT ON COLUMN boards.deleted_at IS 'Fecha de borrado logico. Si tiene valor, la app lo oculta.';

-- Listas o columnas dentro de un tablero.
CREATE TABLE IF NOT EXISTS lists (
  id SERIAL PRIMARY KEY,
  board_id INTEGER NOT NULL REFERENCES boards(id),
  name VARCHAR(120) NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  type VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (type IN ('active', 'completed')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP
);

COMMENT ON TABLE lists IS 'Columnas del tablero. Si una lista es completed, sus tareas se consideran finalizadas.';
COMMENT ON COLUMN lists.position IS 'Orden visual de la columna dentro del tablero.';

-- Tarjetas o tareas. Pueden estar asignadas a un usuario o sin asignar.
CREATE TABLE IF NOT EXISTS cards (
  id SERIAL PRIMARY KEY,
  board_id INTEGER NOT NULL REFERENCES boards(id),
  list_id INTEGER NOT NULL REFERENCES lists(id),
  title VARCHAR(180) NOT NULL,
  description TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  assigned_to INTEGER REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  position INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP
);

COMMENT ON TABLE cards IS 'Tareas del tablero. Se mueven entre listas y guardan su orden.';
COMMENT ON COLUMN cards.assigned_to IS 'Usuario responsable. Puede ser null para indicar sin asignar.';

-- Subtareas tipo checklist avanzada dentro de una tarjeta.
CREATE TABLE IF NOT EXISTS subtasks (
  id SERIAL PRIMARY KEY,
  card_id INTEGER NOT NULL REFERENCES cards(id),
  title VARCHAR(180) NOT NULL,
  description TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  assigned_to INTEGER REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  position INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP
);

COMMENT ON TABLE subtasks IS 'Pasos pequeños dentro de una tarea principal.';
COMMENT ON COLUMN subtasks.position IS 'Orden visual de la subtarea dentro del detalle de la tarjeta.';

-- Auditoria de acciones importantes. La aplicacion solo la lee, no la edita.
CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(40) NOT NULL CHECK (entity_type IN ('user', 'board', 'list', 'card', 'subtask')),
  entity_id INTEGER NOT NULL,
  board_id INTEGER REFERENCES boards(id),
  card_id INTEGER REFERENCES cards(id),
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE activity_log IS 'Historial de cambios relevantes: quien hizo que, sobre que elemento y cuando.';
COMMENT ON COLUMN activity_log.old_value IS 'Datos antes del cambio, guardados como JSON.';
COMMENT ON COLUMN activity_log.new_value IS 'Datos despues del cambio, guardados como JSON.';

-- Indices para que las consultas habituales sean rapidas.
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_boards_created_by ON boards(created_by);
CREATE INDEX IF NOT EXISTS idx_boards_status ON boards(status);
CREATE INDEX IF NOT EXISTS idx_boards_deleted_at ON boards(deleted_at);
CREATE INDEX IF NOT EXISTS idx_lists_board_id ON lists(board_id);
CREATE INDEX IF NOT EXISTS idx_lists_board_position ON lists(board_id, position);
CREATE INDEX IF NOT EXISTS idx_lists_type ON lists(type);
CREATE INDEX IF NOT EXISTS idx_cards_board_id ON cards(board_id);
CREATE INDEX IF NOT EXISTS idx_cards_list_id ON cards(list_id);
CREATE INDEX IF NOT EXISTS idx_cards_list_position ON cards(list_id, position);
CREATE INDEX IF NOT EXISTS idx_cards_assigned_to ON cards(assigned_to);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);
CREATE INDEX IF NOT EXISTS idx_cards_deleted_at ON cards(deleted_at);
CREATE INDEX IF NOT EXISTS idx_subtasks_card_id ON subtasks(card_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_assigned_to ON subtasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_subtasks_status ON subtasks(status);
CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_board ON activity_log(board_id);
CREATE INDEX IF NOT EXISTS idx_activity_card ON activity_log(card_id);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_log(created_at);

COMMIT;

