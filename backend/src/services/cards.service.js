import { consultar, conTransaccion } from '../db/query.js';
import { listarActividadPorTarea, registrarActividad } from './audit.service.js';
import { crearError } from '../utils/http-error.js';

export async function crearTarjeta(userId, listId, datos) {
  return conTransaccion(async (cliente) => {
    const lista = await buscarLista(cliente, listId);
    await validarUsuarioAsignado(cliente, datos.assigned_to);

    const { rows: posicionRows } = await cliente.query(
      `SELECT COALESCE(MAX(position), -1) + 1 AS siguiente
       FROM cards
       WHERE list_id = $1 AND deleted_at IS NULL`,
      [listId]
    );

    const estado = lista.type === 'completed' ? 'completed' : 'active';
    const completedAt = estado === 'completed' ? new Date() : null;

    const { rows } = await cliente.query(
      `INSERT INTO cards
        (board_id, list_id, title, description, created_by, assigned_to, status, position, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        lista.board_id,
        listId,
        datos.title,
        datos.description || null,
        userId,
        datos.assigned_to || null,
        estado,
        posicionRows[0].siguiente,
        completedAt
      ]
    );

    await registrarActividad(cliente, {
      userId,
      action: 'tarea_creada',
      entityType: 'card',
      entityId: rows[0].id,
      boardId: lista.board_id,
      cardId: rows[0].id,
      newValue: rows[0]
    });

    return rows[0];
  });
}

export async function obtenerDetalleTarjeta(cardId) {
  const [tarjeta] = await consultar(
    `SELECT c.*, b.name AS board_name, l.name AS list_name,
       creador.name AS created_by_name, asignado.name AS assigned_to_name
     FROM cards c
     JOIN boards b ON b.id = c.board_id
     JOIN lists l ON l.id = c.list_id
     JOIN users creador ON creador.id = c.created_by
     LEFT JOIN users asignado ON asignado.id = c.assigned_to
     WHERE c.id = $1 AND c.deleted_at IS NULL`,
    [cardId]
  );

  if (!tarjeta) throw crearError('Tarea no encontrada', 404);

  const subtasks = await consultar(
    `SELECT s.*, asignado.name AS assigned_to_name
     FROM subtasks s
     LEFT JOIN users asignado ON asignado.id = s.assigned_to
     WHERE s.card_id = $1 AND s.deleted_at IS NULL
     ORDER BY s.position ASC, s.id ASC`,
    [cardId]
  );

  const actividad = await conTransaccion((cliente) => listarActividadPorTarea(cliente, cardId));

  return { ...tarjeta, subtasks, activity: actividad };
}

export async function editarTarjeta(userId, cardId, datos) {
  return conTransaccion(async (cliente) => {
    const anterior = await buscarTarjeta(cliente, cardId);

    const { rows } = await cliente.query(
      `UPDATE cards
       SET title = $1, description = $2, updated_at = NOW()
       WHERE id = $3 AND deleted_at IS NULL
       RETURNING *`,
      [datos.title, datos.description || null, cardId]
    );

    await registrarActividad(cliente, {
      userId,
      action: 'tarea_editada',
      entityType: 'card',
      entityId: cardId,
      boardId: anterior.board_id,
      cardId,
      oldValue: anterior,
      newValue: rows[0]
    });

    return rows[0];
  });
}

export async function moverTarjeta(userId, cardId, targetListId, targetPosition) {
  return conTransaccion(async (cliente) => {
    const anterior = await buscarTarjeta(cliente, cardId);
    const listaDestino = await buscarLista(cliente, targetListId);

    if (listaDestino.board_id !== anterior.board_id) {
      throw crearError('La lista destino no pertenece al mismo tablero');
    }

    // Recalculamos el orden de origen y destino para que no queden posiciones repetidas.
    const { rows: tarjetasOrigen } = await cliente.query(
      `SELECT id FROM cards
       WHERE list_id = $1 AND deleted_at IS NULL AND id <> $2
       ORDER BY position ASC, id ASC`,
      [anterior.list_id, cardId]
    );

    const { rows: tarjetasDestino } = await cliente.query(
      `SELECT id FROM cards
       WHERE list_id = $1 AND deleted_at IS NULL AND id <> $2
       ORDER BY position ASC, id ASC`,
      [targetListId, cardId]
    );

    const destinoIds = tarjetasDestino.map((tarjeta) => tarjeta.id);
    destinoIds.splice(Math.min(targetPosition, destinoIds.length), 0, cardId);

    for (const [position, tarjeta] of tarjetasOrigen.entries()) {
      await cliente.query('UPDATE cards SET position = $1 WHERE id = $2', [position, tarjeta.id]);
    }

    for (const [position, id] of destinoIds.entries()) {
      await cliente.query(
        `UPDATE cards
         SET list_id = $1,
             position = $2,
             status = $3,
             completed_at = CASE WHEN $3::varchar = 'completed' THEN COALESCE(completed_at, NOW()) ELSE NULL END,
             updated_at = NOW()
         WHERE id = $4`,
        [targetListId, position, listaDestino.type === 'completed' ? 'completed' : 'active', id]
      );
    }

    const actualizado = await buscarTarjeta(cliente, cardId);

    await registrarActividad(cliente, {
      userId,
      action: 'tarea_movida',
      entityType: 'card',
      entityId: cardId,
      boardId: anterior.board_id,
      cardId,
      oldValue: anterior,
      newValue: actualizado
    });

    return actualizado;
  });
}

export async function asignarTarjeta(userId, cardId, assignedTo) {
  return conTransaccion(async (cliente) => {
    const anterior = await buscarTarjeta(cliente, cardId);
    await validarUsuarioAsignado(cliente, assignedTo);

    const { rows } = await cliente.query(
      `UPDATE cards
       SET assigned_to = $1, updated_at = NOW()
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [assignedTo || null, cardId]
    );

    await registrarActividad(cliente, {
      userId,
      action: assignedTo ? 'tarea_asignada' : 'tarea_desasignada',
      entityType: 'card',
      entityId: cardId,
      boardId: anterior.board_id,
      cardId,
      oldValue: anterior,
      newValue: rows[0]
    });

    return rows[0];
  });
}

export async function cambiarEstadoTarjeta(userId, cardId, completada) {
  return conTransaccion(async (cliente) => {
    const anterior = await buscarTarjeta(cliente, cardId);

    const { rows } = await cliente.query(
      `UPDATE cards
       SET status = $1,
           completed_at = CASE WHEN $2::boolean THEN NOW() ELSE NULL END,
           updated_at = NOW()
       WHERE id = $3 AND deleted_at IS NULL
       RETURNING *`,
      [completada ? 'completed' : 'active', completada, cardId]
    );

    await registrarActividad(cliente, {
      userId,
      action: completada ? 'tarea_completada' : 'tarea_reabierta',
      entityType: 'card',
      entityId: cardId,
      boardId: anterior.board_id,
      cardId,
      oldValue: anterior,
      newValue: rows[0]
    });

    return rows[0];
  });
}

export async function eliminarTarjeta(userId, cardId) {
  return conTransaccion(async (cliente) => {
    const anterior = await buscarTarjeta(cliente, cardId);

    const { rows } = await cliente.query(
      `UPDATE cards
       SET deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [cardId]
    );

    await registrarActividad(cliente, {
      userId,
      action: 'tarea_eliminada',
      entityType: 'card',
      entityId: cardId,
      boardId: anterior.board_id,
      cardId,
      oldValue: anterior,
      newValue: rows[0]
    });

    return rows[0];
  });
}

async function buscarTarjeta(cliente, cardId) {
  const { rows } = await cliente.query(
    'SELECT * FROM cards WHERE id = $1 AND deleted_at IS NULL',
    [cardId]
  );

  if (!rows[0]) throw crearError('Tarea no encontrada', 404);
  return rows[0];
}

async function buscarLista(cliente, listId) {
  const { rows } = await cliente.query(
    'SELECT * FROM lists WHERE id = $1 AND deleted_at IS NULL',
    [listId]
  );

  if (!rows[0]) throw crearError('Lista no encontrada', 404);
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
