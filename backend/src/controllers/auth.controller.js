import { login as loginServicio } from '../services/auth.service.js';
import { cambiarPasswordPropia, usuarioSeguro } from '../services/users.service.js';
import { emailValido, textoObligatorio } from '../utils/validaciones.js';
import { crearError } from '../utils/http-error.js';

export async function login(req, res) {
  const email = emailValido(req.body.email);
  const password = textoObligatorio(req.body.password, 'password');

  const resultado = await loginServicio(email, password);
  res.json(resultado);
}

export async function me(req, res) {
  res.json({ user: usuarioSeguro(req.usuario) });
}

export async function changePassword(req, res) {
  const nuevaPassword = textoObligatorio(req.body.password, 'password');
  if (nuevaPassword.length < 8) {
    throw crearError('La password debe tener al menos 8 caracteres');
  }

  const user = await cambiarPasswordPropia(req.usuario.id, nuevaPassword);
  res.json({ user });
}

