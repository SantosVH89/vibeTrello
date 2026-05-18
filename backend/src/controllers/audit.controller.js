import { idNumerico } from '../utils/validaciones.js';
import { conTransaccion } from '../db/query.js';
import { listarActividadPorTarea } from '../services/audit.service.js';
import { actividadTablero } from '../services/boards.service.js';

export async function cardActivity(req, res) {
  const activity = await conTransaccion((cliente) => listarActividadPorTarea(cliente, idNumerico(req.params.id)));
  res.json({ activity });
}

export async function boardActivity(req, res) {
  res.json({ activity: await actividadTablero(idNumerico(req.params.id)) });
}

