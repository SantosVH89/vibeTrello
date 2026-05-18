import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { consultar } from '../db/query.js';
import { crearError } from '../utils/http-error.js';

// Lee el JWT del header Authorization y recupera el usuario actual.
export async function exigirAuth(req, _res, next) {
  try {
    const cabecera = req.headers.authorization || '';
    const [tipo, token] = cabecera.split(' ');

    if (tipo !== 'Bearer' || !token) {
      throw crearError('Falta el token de autenticacion', 401);
    }

    const payload = jwt.verify(token, config.secretoJwt);
    const [usuario] = await consultar(
      `SELECT id, name, email, role, is_active, must_change_password, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [payload.id]
    );

    if (!usuario || !usuario.is_active) {
      throw crearError('Usuario no autorizado o inactivo', 401);
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    next(error.status ? error : crearError('Token no valido o caducado', 401));
  }
}

// Bloquea el uso de la app si el usuario aun tiene password temporal.
export function exigirPasswordActualizada(req, _res, next) {
  if (req.usuario?.must_change_password) {
    return next(crearError('Debes cambiar la password temporal antes de continuar', 403));
  }

  return next();
}

// Limita una ruta solo a administradores.
export function exigirAdmin(req, _res, next) {
  if (req.usuario?.role !== 'admin') {
    return next(crearError('Solo un administrador puede realizar esta accion', 403));
  }

  return next();
}

