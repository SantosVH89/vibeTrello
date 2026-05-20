-- ============================================================
-- Asignaciones multiples para tareas
-- ============================================================
-- Hasta ahora cada tarea tenia un unico responsable en cards.assigned_to.
-- Esta tabla permite que una tarea tenga varios usuarios asignados.
-- El campo cards.assigned_to se mantiene como primer responsable para no romper
-- pantallas o consultas antiguas mientras la app aprende a leer varios usuarios.

CREATE TABLE IF NOT EXISTS card_assignees (
  card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (card_id, user_id)
);

COMMENT ON TABLE card_assignees IS 'Usuarios asignados a una tarea. Una tarea puede tener uno, varios o ninguno.';
COMMENT ON COLUMN card_assignees.position IS 'Orden visual de los responsables dentro de la tarea.';

CREATE INDEX IF NOT EXISTS idx_card_assignees_user ON card_assignees(user_id);

-- Copia las asignaciones antiguas a la tabla nueva.
-- ON CONFLICT evita duplicados si la migracion se ejecuta de nuevo.
INSERT INTO card_assignees (card_id, user_id, position)
SELECT id, assigned_to, 0
FROM cards
WHERE assigned_to IS NOT NULL
ON CONFLICT (card_id, user_id) DO NOTHING;
