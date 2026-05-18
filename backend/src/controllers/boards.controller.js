import {
  actividadTablero,
  cambiarEstadoTablero,
  crearTablero,
  editarTablero,
  eliminarTablero,
  listarTableros,
  obtenerTableroCompleto
} from '../services/boards.service.js';
import { idNumerico, textoObligatorio } from '../utils/validaciones.js';

export async function listBoards(_req, res) {
  res.json(await listarTableros());
}

export async function createBoard(req, res) {
  const board = await crearTablero(req.usuario.id, {
    name: textoObligatorio(req.body.name, 'name'),
    description: req.body.description || null
  });
  res.status(201).json({ board });
}

export async function getBoard(req, res) {
  res.json({ board: await obtenerTableroCompleto(idNumerico(req.params.id)) });
}

export async function updateBoard(req, res) {
  const board = await editarTablero(req.usuario.id, idNumerico(req.params.id), {
    name: textoObligatorio(req.body.name, 'name'),
    description: req.body.description || null
  });
  res.json({ board });
}

export async function completeBoard(req, res) {
  res.json({ board: await cambiarEstadoTablero(req.usuario.id, idNumerico(req.params.id), true) });
}

export async function reopenBoard(req, res) {
  res.json({ board: await cambiarEstadoTablero(req.usuario.id, idNumerico(req.params.id), false) });
}

export async function deleteBoard(req, res) {
  res.json({ board: await eliminarTablero(req.usuario.id, idNumerico(req.params.id)) });
}

export async function boardActivity(req, res) {
  res.json({ activity: await actividadTablero(idNumerico(req.params.id)) });
}

