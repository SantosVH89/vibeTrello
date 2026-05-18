import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { crearError } from '../utils/http-error.js';
import { obtenerUsuarioPorEmail, usuarioSeguro } from './users.service.js';

// Comprueba credenciales y genera un JWT si todo es correcto.
export async function login(email, password) {
  const usuario = await obtenerUsuarioPorEmail(email);

  if (!usuario || !usuario.is_active) {
    throw crearError('Credenciales incorrectas o usuario inactivo', 401);
  }

  const passwordCorrecta = await bcrypt.compare(password, usuario.password_hash);
  if (!passwordCorrecta) {
    throw crearError('Credenciales incorrectas', 401);
  }

  const token = jwt.sign(
    { id: usuario.id, role: usuario.role },
    config.secretoJwt,
    { expiresIn: config.duracionJwt }
  );

  return { token, user: usuarioSeguro(usuario) };
}

