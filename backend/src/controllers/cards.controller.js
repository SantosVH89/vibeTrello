import {
  asignarTarjeta,
  cambiarEstadoTarjeta,
  crearTarjeta,
  editarTarjeta,
  eliminarTarjeta,
  moverTarjeta,
  obtenerDetalleTarjeta
} from '../services/cards.service.js';
import { idNumerico, posicionValida, textoObligatorio } from '../utils/validaciones.js';

export async function createCard(req, res) {
  const assignedToIds = Array.isArray(req.body.assigned_to_ids)
    ? req.body.assigned_to_ids.map((id) => idNumerico(id, 'assigned_to_ids'))
    : [];

  const card = await crearTarjeta(req.usuario.id, idNumerico(req.params.listId, 'listId'), {
    title: textoObligatorio(req.body.title, 'title'),
    description: req.body.description || null,
    assigned_to: req.body.assigned_to || null,
    assigned_to_ids: assignedToIds
  });
  res.status(201).json({ card });
}

export async function getCard(req, res) {
  res.json({ card: await obtenerDetalleTarjeta(idNumerico(req.params.id)) });
}

export async function updateCard(req, res) {
  const card = await editarTarjeta(req.usuario.id, idNumerico(req.params.id), {
    title: textoObligatorio(req.body.title, 'title'),
    description: req.body.description || null
  });
  res.json({ card });
}

export async function moveCard(req, res) {
  const card = await moverTarjeta(
    req.usuario.id,
    idNumerico(req.params.id),
    idNumerico(req.body.target_list_id, 'target_list_id'),
    posicionValida(req.body.target_position, 'target_position')
  );
  res.json({ card });
}

export async function assignCard(req, res) {
  const asignados = Array.isArray(req.body.assigned_to_ids)
    ? req.body.assigned_to_ids.map((id) => idNumerico(id, 'assigned_to_ids'))
    : (req.body.assigned_to ? [idNumerico(req.body.assigned_to, 'assigned_to')] : []);

  res.json({ card: await asignarTarjeta(req.usuario.id, idNumerico(req.params.id), asignados) });
}

export async function completeCard(req, res) {
  res.json({ card: await cambiarEstadoTarjeta(req.usuario.id, idNumerico(req.params.id), true) });
}

export async function reopenCard(req, res) {
  res.json({ card: await cambiarEstadoTarjeta(req.usuario.id, idNumerico(req.params.id), false) });
}

export async function deleteCard(req, res) {
  res.json({ card: await eliminarTarjeta(req.usuario.id, idNumerico(req.params.id)) });
}
