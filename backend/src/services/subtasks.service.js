import { conTransaccion } from '../db/query.js';
import { registrarActividad } from './audit.service.js';
import { crearError } from '../utils/http-error.js';

export async function crearSubtarea(userId, cardId, datos) {
  return conTransaccion(async (cliente) => {
    const tarjeta = await buscarTarjeta(cliente, cardId);
    await validarUsuarioAsignado(cliente, datos.assigned_to);

    const { rows: posicionRows } = await cliente.query(
      `SELECT COALESCE(MAX(position), -1) + 1 AS siguiente
       FROM subtasks
       WHERE card_id = $1 AND deleted_at IS NULL`,
      [cardId]
    );

    const { rows } = await cliente.query(
      `INSERT INTO subtasks (card_id, title, description, created_by, assigned_to, position)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [cardId, datos.title, datos.description || null, userId, datos.assigned_to || null, posicionRows[0].siguiente]
    );

    await registrarActividad(cliente, {
      userId,
      action: 'subtarea_creada',
      entityType: 'subtask',
      entityId: rows[0].id,
      boardId: tarjeta.board_id,
      cardId,
      newValue: rows[0]
    });

    return rows[0];
  });
}

export async function editarSubtarea(userId, subtaskId, datos) {
  return conTransaccion(async (cliente) => {
    const anterior = await buscarSubtarea(cliente, subtaskId);
    const tarjeta = await buscarTarjeta(cliente, anterior.card_id);

    const { rows } = await cliente.query(
      `UPDATE subtasks
       SET title = $1, description = $2, updated_at = NOW()
       WHERE id = $3 AND deleted_at IS NULL
       RETURNING *`,
      [datos.title, datos.description || null, subtaskId]
    );

    await registrarActividad(cliente, {
      userId,
      action: 'subtarea_editada',
      entityType: 'subtask',
      entityId: subtaskId,
      boardId: tarjeta.board_id,
      cardId: anterior.card_id,
      oldValue: anterior,
      newValue: rows[0]
    });

    return rows[0];
  });
}

export async function asignarSubtarea(userId, subtaskId, assignedTo) {
  return conTransaccion(async (cliente) => {
    const anterior = await buscarSubtarea(cliente, subtaskId);
    const tarjeta = await buscarTarjeta(cliente, anterior.card_id);
    await validarUsuarioAsignado(cliente, assignedTo);

    const { rows } = await cliente.query(
      `UPDATE subtasks
       SET assigned_to = $1, updated_at = NOW()
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [assignedTo || null, subtaskId]
    );

    await registrarActividad(cliente, {
      userId,
      action: assignedTo ? 'subtarea_asignada' : 'subtarea_desasignada',
      entityType: 'subtask',
      entityId: subtaskId,
      boardId: tarjeta.board_id,
      cardId: anterior.card_id,
      oldValue: anterior,
      newValue: rows[0]
    });

    return rows[0];
  });
}

export async function cambiarEstadoSubtarea(userId, subtaskId, completada) {
  return conTransaccion(async (cliente) => {
    const anterior = await buscarSubtarea(cliente, subtaskId);
    const tarjeta = await buscarTarjeta(cliente, anterior.card_id);

    const { rows } = await cliente.query(
      `UPDATE subtasks
       SET status = $1,
           completed_at = CASE WHEN $2 THEN NOW() ELSE NULL END,
           updated_at = NOW()
       WHERE id = $3 AND deleted_at IS NULL
       RETURNING *`,
      [completada ? 'completed' : 'pending', completada, subtaskId]
    );

    await registrarActividad(cliente, {
      userId,
      action: completada ? 'subtarea_completada' : 'subtarea_reabierta',
      entityType: 'subtask',
      entityId: subtaskId,
      boardId: tarjeta.board_id,
      cardId: anterior.card_id,
      oldValue: anterior,
      newValue: rows[0]
    });

    return rows[0];
  });
}

export async function reordenarSubtareas(userId, cardId, orderedIds) {
  return conTransaccion(async (cliente) => {
    const tarjeta = await buscarTarjeta(cliente, cardId);

    for (const [position, id] of orderedIds.entries()) {
      await cliente.query(
        `UPDATE subtasks
         SET position = $1, updated_at = NOW()
         WHERE id = $2 AND card_id = $3 AND deleted_at IS NULL`,
        [position, id, cardId]
      );
    }

    await registrarActividad(cliente, {
      userId,
      action: 'subtareas_reordenadas',
      entityType: 'card',
      entityId: cardId,
      boardId: tarjeta.board_id,
      cardId,
      newValue: { orderedIds }
    });

    return { orderedIds };
  });
}

export async function eliminarSubtarea(userId, subtaskId) {
  return conTransaccion(async (cliente) => {
    const anterior = await buscarSubtarea(cliente, subtaskId);
    const tarjeta = await buscarTarjeta(cliente, anterior.card_id);

    const { rows } = await cliente.query(
      `UPDATE subtasks
       SET deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [subtaskId]
    );

    await registrarActividad(cliente, {
      userId,
      action: 'subtarea_eliminada',
      entityType: 'subtask',
      entityId: subtaskId,
      boardId: tarjeta.board_id,
      cardId: anterior.card_id,
      oldValue: anterior,
      newValue: rows[0]
    });

    return rows[0];
  });
}

async function buscarSubtarea(cliente, subtaskId) {
  const { rows } = await cliente.query(
    'SELECT * FROM subtasks WHERE id = $1 AND deleted_at IS NULL',
    [subtaskId]
  );

  if (!rows[0]) throw crearError('Subtarea no encontrada', 404);
  return rows[0];
}

async function buscarTarjeta(cliente, cardId) {
  const { rows } = await cliente.query(
    'SELECT * FROM cards WHERE id = $1 AND deleted_at IS NULL',
    [cardId]
  );

  if (!rows[0]) throw crearError('Tarea no encontrada', 404);
  return rows[0];
}

async function validarUsuarioAsignado(cliente, userId) {
  if (!userId) return;

  const { rows } = await cliente.query(
    'SELECT id FROM users WHERE id = $1 AND is_active = true',
    [userId]
  );

  if (!rows[0]) throw crearError('El usuario asignado no existe o no esta activo');
}

