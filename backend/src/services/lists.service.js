import { conTransaccion } from '../db/query.js';
import { registrarActividad } from './audit.service.js';
import { crearError } from '../utils/http-error.js';

export async function crearLista(userId, boardId, datos) {
  return conTransaccion(async (cliente) => {
    await asegurarTableroExiste(cliente, boardId);

    const { rows: posicionRows } = await cliente.query(
      `SELECT COALESCE(MAX(position), -1) + 1 AS siguiente
       FROM lists
       WHERE board_id = $1 AND deleted_at IS NULL`,
      [boardId]
    );

    const { rows } = await cliente.query(
      `INSERT INTO lists (board_id, name, type, position)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [boardId, datos.name, datos.type || 'active', posicionRows[0].siguiente]
    );

    await registrarActividad(cliente, {
      userId,
      action: 'lista_creada',
      entityType: 'list',
      entityId: rows[0].id,
      boardId,
      newValue: rows[0]
    });

    return rows[0];
  });
}

export async function editarLista(userId, listId, datos) {
  return conTransaccion(async (cliente) => {
    const anterior = await buscarLista(cliente, listId);

    const { rows } = await cliente.query(
      `UPDATE lists
       SET name = $1, updated_at = NOW()
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [datos.name, listId]
    );

    await registrarActividad(cliente, {
      userId,
      action: 'lista_editada',
      entityType: 'list',
      entityId: listId,
      boardId: anterior.board_id,
      oldValue: anterior,
      newValue: rows[0]
    });

    return rows[0];
  });
}

export async function cambiarTipoLista(userId, listId, type) {
  return conTransaccion(async (cliente) => {
    const anterior = await buscarLista(cliente, listId);

    const { rows } = await cliente.query(
      `UPDATE lists
       SET type = $1, updated_at = NOW()
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [type, listId]
    );

    // Las tarjetas dentro de esta lista heredan automaticamente el estado de la lista.
    await cliente.query(
      `UPDATE cards
       SET status = $1,
           completed_at = CASE WHEN $1::varchar = 'completed' THEN COALESCE(completed_at, NOW()) ELSE NULL END,
           updated_at = NOW()
       WHERE list_id = $2 AND deleted_at IS NULL`,
      [type === 'completed' ? 'completed' : 'active', listId]
    );

    await registrarActividad(cliente, {
      userId,
      action: type === 'completed' ? 'lista_tipo_completed' : 'lista_tipo_active',
      entityType: 'list',
      entityId: listId,
      boardId: anterior.board_id,
      oldValue: anterior,
      newValue: rows[0]
    });

    return rows[0];
  });
}

export async function reordenarListas(userId, boardId, orderedIds) {
  return conTransaccion(async (cliente) => {
    await asegurarTableroExiste(cliente, boardId);

    for (const [position, id] of orderedIds.entries()) {
      await cliente.query(
        `UPDATE lists
         SET position = $1, updated_at = NOW()
         WHERE id = $2 AND board_id = $3 AND deleted_at IS NULL`,
        [position, id, boardId]
      );
    }

    await registrarActividad(cliente, {
      userId,
      action: 'listas_reordenadas',
      entityType: 'board',
      entityId: boardId,
      boardId,
      newValue: { orderedIds }
    });

    return { orderedIds };
  });
}

export async function eliminarLista(userId, listId) {
  return conTransaccion(async (cliente) => {
    const anterior = await buscarLista(cliente, listId);

    const { rows } = await cliente.query(
      `UPDATE lists
       SET deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [listId]
    );

    await registrarActividad(cliente, {
      userId,
      action: 'lista_eliminada',
      entityType: 'list',
      entityId: listId,
      boardId: anterior.board_id,
      oldValue: anterior,
      newValue: rows[0]
    });

    return rows[0];
  });
}

async function buscarLista(cliente, listId) {
  const { rows } = await cliente.query(
    'SELECT * FROM lists WHERE id = $1 AND deleted_at IS NULL',
    [listId]
  );

  if (!rows[0]) throw crearError('Lista no encontrada', 404);
  return rows[0];
}

async function asegurarTableroExiste(cliente, boardId) {
  const { rows } = await cliente.query(
    'SELECT id FROM boards WHERE id = $1 AND deleted_at IS NULL',
    [boardId]
  );

  if (!rows[0]) throw crearError('Tablero no encontrado', 404);
}
