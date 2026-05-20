import { consultar, conTransaccion } from '../db/query.js';
import { registrarActividad, listarActividadPorTablero } from './audit.service.js';
import { crearError } from '../utils/http-error.js';

export async function listarTableros() {
  const filas = await consultar(
    `SELECT b.*, u.name AS created_by_name
     FROM boards b
     JOIN users u ON u.id = b.created_by
     WHERE b.deleted_at IS NULL
     ORDER BY b.updated_at DESC`
  );

  // La pantalla principal separa activos y completados desde el backend.
  return {
    active: filas.filter((tablero) => tablero.status === 'active'),
    completed: filas.filter((tablero) => tablero.status === 'completed')
  };
}

export async function crearTablero(userId, datos) {
  return conTransaccion(async (cliente) => {
    const { rows } = await cliente.query(
      `INSERT INTO boards (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [datos.name, datos.description || null, userId]
    );

    await registrarActividad(cliente, {
      userId,
      action: 'tablero_creado',
      entityType: 'board',
      entityId: rows[0].id,
      boardId: rows[0].id,
      newValue: rows[0]
    });

    return rows[0];
  });
}

export async function obtenerTableroCompleto(boardId) {
  const [tablero] = await consultar(
    `SELECT b.*, u.name AS created_by_name
     FROM boards b
     JOIN users u ON u.id = b.created_by
     WHERE b.id = $1 AND b.deleted_at IS NULL`,
    [boardId]
  );

  if (!tablero) throw crearError('Tablero no encontrado', 404);

  const listas = await consultar(
    `SELECT *
     FROM lists
     WHERE board_id = $1 AND deleted_at IS NULL
     ORDER BY position ASC, id ASC`,
    [boardId]
  );

  const tarjetas = await consultar(
    `SELECT c.*, creador.name AS created_by_name, asignado.name AS assigned_to_name,
       COALESCE(asignaciones.assigned_to_ids, ARRAY[]::integer[]) AS assigned_to_ids,
       COALESCE(asignaciones.assigned_to_names, ARRAY[]::text[]) AS assigned_to_names,
       COALESCE(asignaciones.assignees, '[]'::json) AS assignees,
       COALESCE(st.total, 0)::int AS subtasks_total,
       COALESCE(st.completed, 0)::int AS subtasks_completed
     FROM cards c
     JOIN users creador ON creador.id = c.created_by
     LEFT JOIN users asignado ON asignado.id = c.assigned_to
     LEFT JOIN LATERAL (
       SELECT
         ARRAY_AGG(u.id ORDER BY ca.position, u.name) AS assigned_to_ids,
         ARRAY_AGG(u.name ORDER BY ca.position, u.name) AS assigned_to_names,
         JSON_AGG(JSON_BUILD_OBJECT('id', u.id, 'name', u.name) ORDER BY ca.position, u.name) AS assignees
       FROM card_assignees ca
       JOIN users u ON u.id = ca.user_id
       WHERE ca.card_id = c.id
     ) asignaciones ON true
     LEFT JOIN (
       SELECT card_id,
         COUNT(*) FILTER (WHERE deleted_at IS NULL) AS total,
         COUNT(*) FILTER (WHERE deleted_at IS NULL AND status = 'completed') AS completed
       FROM subtasks
       GROUP BY card_id
     ) st ON st.card_id = c.id
     WHERE c.board_id = $1 AND c.deleted_at IS NULL
     ORDER BY c.position ASC, c.id ASC`,
    [boardId]
  );

  return {
    ...tablero,
    lists: listas.map((lista) => ({
      ...lista,
      cards: tarjetas.filter((tarjeta) => tarjeta.list_id === lista.id)
    }))
  };
}

export async function editarTablero(userId, boardId, datos) {
  return conTransaccion(async (cliente) => {
    const anterior = await buscarTablero(cliente, boardId);

    const { rows } = await cliente.query(
      `UPDATE boards
       SET name = $1, description = $2, updated_at = NOW()
       WHERE id = $3 AND deleted_at IS NULL
       RETURNING *`,
      [datos.name, datos.description || null, boardId]
    );

    await registrarActividad(cliente, {
      userId,
      action: 'tablero_editado',
      entityType: 'board',
      entityId: boardId,
      boardId,
      oldValue: anterior,
      newValue: rows[0]
    });

    return rows[0];
  });
}

export async function cambiarEstadoTablero(userId, boardId, completado) {
  return conTransaccion(async (cliente) => {
    const anterior = await buscarTablero(cliente, boardId);

    const { rows } = await cliente.query(
      `UPDATE boards
       SET status = $1,
           completed_at = CASE WHEN $2 THEN NOW() ELSE NULL END,
           updated_at = NOW()
       WHERE id = $3 AND deleted_at IS NULL
       RETURNING *`,
      [completado ? 'completed' : 'active', completado, boardId]
    );

    await registrarActividad(cliente, {
      userId,
      action: completado ? 'tablero_completado' : 'tablero_reabierto',
      entityType: 'board',
      entityId: boardId,
      boardId,
      oldValue: anterior,
      newValue: rows[0]
    });

    return rows[0];
  });
}

export async function eliminarTablero(userId, boardId) {
  return conTransaccion(async (cliente) => {
    const anterior = await buscarTablero(cliente, boardId);

    const { rows } = await cliente.query(
      `UPDATE boards
       SET deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [boardId]
    );

    await registrarActividad(cliente, {
      userId,
      action: 'tablero_eliminado',
      entityType: 'board',
      entityId: boardId,
      boardId,
      oldValue: anterior,
      newValue: rows[0]
    });

    return rows[0];
  });
}

export async function actividadTablero(boardId) {
  return conTransaccion(async (cliente) => listarActividadPorTablero(cliente, boardId));
}

async function buscarTablero(cliente, boardId) {
  const { rows } = await cliente.query(
    'SELECT * FROM boards WHERE id = $1 AND deleted_at IS NULL',
    [boardId]
  );

  if (!rows[0]) throw crearError('Tablero no encontrado', 404);
  return rows[0];
}
