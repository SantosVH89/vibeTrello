import {
  cambiarEstadoUsuario,
  crearUsuarioAdmin,
  editarUsuarioAdmin,
  listarUsuariosActivos,
  listarUsuariosAdmin,
  resetearPassword
} from '../services/users.service.js';
import { emailValido, idNumerico, opcionValida, textoObligatorio } from '../utils/validaciones.js';
import { crearError } from '../utils/http-error.js';

export async function listActiveUsers(_req, res) {
  res.json({ users: await listarUsuariosActivos() });
}

export async function listAdminUsers(_req, res) {
  res.json({ users: await listarUsuariosAdmin() });
}

export async function createAdminUser(req, res) {
  const datos = validarUsuario(req.body, true);
  const user = await crearUsuarioAdmin(req.usuario.id, datos);
  res.status(201).json({ user });
}

export async function updateAdminUser(req, res) {
  const userId = idNumerico(req.params.id);
  const datos = validarUsuario(req.body, false);
  const user = await editarUsuarioAdmin(req.usuario.id, userId, datos);
  res.json({ user });
}

export async function activateAdminUser(req, res) {
  const user = await cambiarEstadoUsuario(req.usuario.id, idNumerico(req.params.id), true);
  res.json({ user });
}

export async function deactivateAdminUser(req, res) {
  if (req.usuario.id === idNumerico(req.params.id)) {
    throw crearError('No puedes desactivar tu propio usuario');
  }

  const user = await cambiarEstadoUsuario(req.usuario.id, idNumerico(req.params.id), false);
  res.json({ user });
}

export async function resetPasswordAdminUser(req, res) {
  const user = await resetearPassword(req.usuario.id, idNumerico(req.params.id));
  res.json({ user });
}

function validarUsuario(body, creando) {
  const password = body.password || undefined;
  if (creando && password && password.length < 8) {
    throw crearError('La password temporal debe tener al menos 8 caracteres');
  }

  return {
    name: textoObligatorio(body.name, 'name'),
    email: emailValido(body.email),
    role: opcionValida(body.role, ['admin', 'user'], 'role'),
    is_active: body.is_active ?? true,
    password
  };
}

