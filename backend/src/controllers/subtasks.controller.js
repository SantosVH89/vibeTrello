import {
  asignarSubtarea,
  cambiarEstadoSubtarea,
  crearSubtarea,
  editarSubtarea,
  eliminarSubtarea,
  reordenarSubtareas
} from '../services/subtasks.service.js';
import { idNumerico, textoObligatorio } from '../utils/validaciones.js';
import { crearError } from '../utils/http-error.js';

export async function createSubtask(req, res) {
  const subtask = await crearSubtarea(req.usuario.id, idNumerico(req.params.cardId, 'cardId'), {
    title: textoObligatorio(req.body.title, 'title'),
    description: req.body.description || null,
    assigned_to: req.body.assigned_to || null
  });
  res.status(201).json({ subtask });
}

export async function updateSubtask(req, res) {
  const subtask = await editarSubtarea(req.usuario.id, idNumerico(req.params.id), {
    title: textoObligatorio(req.body.title, 'title'),
    description: req.body.description || null
  });
  res.json({ subtask });
}

export async function assignSubtask(req, res) {
  const assignedTo = req.body.assigned_to ? idNumerico(req.body.assigned_to, 'assigned_to') : null;
  res.json({ subtask: await asignarSubtarea(req.usuario.id, idNumerico(req.params.id), assignedTo) });
}

export async function completeSubtask(req, res) {
  res.json({ subtask: await cambiarEstadoSubtarea(req.usuario.id, idNumerico(req.params.id), true) });
}

export async function reopenSubtask(req, res) {
  res.json({ subtask: await cambiarEstadoSubtarea(req.usuario.id, idNumerico(req.params.id), false) });
}

export async function reorderSubtasks(req, res) {
  if (!Array.isArray(req.body.orderedIds)) {
    throw crearError('orderedIds debe ser una lista de ids');
  }

  res.json(await reordenarSubtareas(
    req.usuario.id,
    idNumerico(req.params.cardId, 'cardId'),
    req.body.orderedIds.map((id) => idNumerico(id))
  ));
}

export async function deleteSubtask(req, res) {
  res.json({ subtask: await eliminarSubtarea(req.usuario.id, idNumerico(req.params.id)) });
}

