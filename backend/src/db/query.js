import { pool } from './pool.js';

// Ejecuta una consulta SQL sencilla y devuelve las filas.
export async function consultar(sql, parametros = []) {
  const resultado = await pool.query(sql, parametros);
  return resultado.rows;
}

// Ejecuta varias consultas dentro de una transaccion.
// Si cualquier paso falla, PostgreSQL deshace todo para no dejar datos a medias.
export async function conTransaccion(trabajo) {
  const cliente = await pool.connect();

  try {
    await cliente.query('BEGIN');
    const resultado = await trabajo(cliente);
    await cliente.query('COMMIT');
    return resultado;
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }
}

