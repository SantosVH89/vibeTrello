import bcrypt from 'bcryptjs';
import { consultar, conTransaccion } from '../db/query.js';
import { registrarActividad } from './audit.service.js';
import { config } from '../config.js';
import { crearError } from '../utils/http-error.js';

// Devuelve solo campos seguros. password_hash nunca sale de la API.
export function usuarioSeguro(usuario) {
  if (!usuario) return null;
  const { password_hash: _passwordHash, ...seguro } = usuario;
  return seguro;
}

export async function listarUsuariosActivos() {
  return consultar(
    `SELECT id, name, email, role
     FROM users
     WHERE is_active = true
     ORDER BY name ASC`
  );
}

export async function listarUsuariosAdmin() {
  return consultar(
    `SELECT id, name, email, role, is_active, must_change_password, created_at, updated_at
     FROM users
     ORDER BY created_at DESC`
  );
}

export async function obtenerUsuarioPorEmail(email) {
  const [usuario] = await consultar('SELECT * FROM users WHERE email = $1', [email]);
  return usuario;
}

export async function crearUsuarioAdmin(actorId, datos) {
  const hash = await bcrypt.hash(datos.password || config.passwordTemporal, 10);

  return conTransaccion(async (cliente) => {
    const { rows } = await cliente.query(
      `INSERT INTO users (name, email, password_hash, role, is_active, must_change_password)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, name, email, role, is_active, must_change_password, created_at, updated_at`,
      [datos.name, datos.email, hash, datos.role, datos.is_active ?? true]
    );

    await registrarActividad(cliente, {
      userId: actorId,
      action: 'usuario_creado',
      entityType: 'user',
      entityId: rows[0].id,
      newValue: rows[0]
    });

    return rows[0];
  });
}

export async function editarUsuarioAdmin(actorId, userId, datos) {
  return conTransaccion(async (cliente) => {
    const anterior = await buscarUsuarioParaAdmin(cliente, userId);

    const { rows } = await cliente.query(
      `UPDATE users
       SET name = $1, email = $2, role = $3, is_active = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, email, role, is_active, must_change_password, created_at, updated_at`,
      [datos.name, datos.email, datos.role, datos.is_active, userId]
    );

    await registrarActividad(cliente, {
      userId: actorId,
      action: 'usuario_editado',
      entityType: 'user',
      entityId: userId,
      oldValue: anterior,
      newValue: rows[0]
    });

    return rows[0];
  });
}

export async function cambiarEstadoUsuario(actorId, userId, activo) {
  return conTransaccion(async (cliente) => {
    const anterior = await buscarUsuarioParaAdmin(cliente, userId);

    const { rows } = await cliente.query(
      `UPDATE users
       SET is_active = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, email, role, is_active, must_change_password, created_at, updated_at`,
      [activo, userId]
    );

    await registrarActividad(cliente, {
      userId: actorId,
      action: activo ? 'usuario_activado' : 'usuario_desactivado',
      entityType: 'user',
      entityId: userId,
      oldValue: anterior,
      newValue: rows[0]
    });

    return rows[0];
  });
}

export async function resetearPassword(actorId, userId) {
  const hash = await bcrypt.hash(config.passwordTemporal, 10);

  return conTransaccion(async (cliente) => {
    const anterior = await buscarUsuarioParaAdmin(cliente, userId);

    const { rows } = await cliente.query(
      `UPDATE users
       SET password_hash = $1, must_change_password = true, updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, email, role, is_active, must_change_password, created_at, updated_at`,
      [hash, userId]
    );

    await registrarActividad(cliente, {
      userId: actorId,
      action: 'password_reseteada',
      entityType: 'user',
      entityId: userId,
      oldValue: anterior,
      newValue: rows[0]
    });

    return rows[0];
  });
}

export async function cambiarPasswordPropia(userId, nuevaPassword) {
  const hash = await bcrypt.hash(nuevaPassword, 10);

  return conTransaccion(async (cliente) => {
    const anterior = await buscarUsuarioParaAdmin(cliente, userId);

    const { rows } = await cliente.query(
      `UPDATE users
       SET password_hash = $1, must_change_password = false, updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, email, role, is_active, must_change_password, created_at, updated_at`,
      [hash, userId]
    );

    await registrarActividad(cliente, {
      userId,
      action: 'password_obligatoria_cambiada',
      entityType: 'user',
      entityId: userId,
      oldValue: anterior,
      newValue: rows[0]
    });

    return rows[0];
  });
}

async function buscarUsuarioParaAdmin(cliente, userId) {
  const { rows } = await cliente.query(
    `SELECT id, name, email, role, is_active, must_change_password, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [userId]
  );

  if (!rows[0]) {
    throw crearError('Usuario no encontrado', 404);
  }

  return rows[0];
}

