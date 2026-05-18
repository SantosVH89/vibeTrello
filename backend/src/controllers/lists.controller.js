import {
  cambiarTipoLista,
  crearLista,
  editarLista,
  eliminarLista,
  reordenarListas
} from '../services/lists.service.js';
import { idNumerico, opcionValida, textoObligatorio } from '../utils/validaciones.js';
import { crearError } from '../utils/http-error.js';

export async function createList(req, res) {
  const list = await crearLista(req.usuario.id, idNumerico(req.params.boardId, 'boardId'), {
    name: textoObligatorio(req.body.name, 'name'),
    type: req.body.type ? opcionValida(req.body.type, ['active', 'completed'], 'type') : 'active'
  });
  res.status(201).json({ list });
}

export async function updateList(req, res) {
  const list = await editarLista(req.usuario.id, idNumerico(req.params.id), {
    name: textoObligatorio(req.body.name, 'name')
  });
  res.json({ list });
}

export async function reorderLists(req, res) {
  if (!Array.isArray(req.body.orderedIds)) {
    throw crearError('orderedIds debe ser una lista de ids');
  }

  res.json(await reordenarListas(
    req.usuario.id,
    idNumerico(req.params.boardId, 'boardId'),
    req.body.orderedIds.map((id) => idNumerico(id))
  ));
}

export async function changeListType(req, res) {
  const list = await cambiarTipoLista(
    req.usuario.id,
    idNumerico(req.params.id),
    opcionValida(req.body.type, ['active', 'completed'], 'type')
  );
  res.json({ list });
}

export async function deleteList(req, res) {
  res.json({ list: await eliminarLista(req.usuario.id, idNumerico(req.params.id)) });
}

