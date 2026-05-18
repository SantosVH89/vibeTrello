// Guarda una entrada de auditoria. Recibe cliente porque muchas acciones
// lo llaman dentro de la misma transaccion que modifica los datos.
export async function registrarActividad(cliente, datos) {
  const {
    userId,
    action,
    entityType,
    entityId,
    boardId = null,
    cardId = null,
    oldValue = null,
    newValue = null
  } = datos;

  await cliente.query(
    `INSERT INTO activity_log
      (user_id, action, entity_type, entity_id, board_id, card_id, old_value, new_value)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [userId, action, entityType, entityId, boardId, cardId, oldValue, newValue]
  );
}

// Formatea la actividad con el nombre de usuario para mostrarla en la UI.
export async function listarActividadPorTarea(db, cardId) {
  const { rows } = await db.query(
    `SELECT al.*, u.name AS user_name
     FROM activity_log al
     LEFT JOIN users u ON u.id = al.user_id
     WHERE al.card_id = $1
     ORDER BY al.created_at DESC
     LIMIT 100`,
    [cardId]
  );

  return rows;
}

export async function listarActividadPorTablero(db, boardId) {
  const { rows } = await db.query(
    `SELECT al.*, u.name AS user_name
     FROM activity_log al
     LEFT JOIN users u ON u.id = al.user_id
     WHERE al.board_id = $1
     ORDER BY al.created_at DESC
     LIMIT 100`,
    [boardId]
  );

  return rows;
}

