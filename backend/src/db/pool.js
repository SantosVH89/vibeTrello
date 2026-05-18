import pg from 'pg';
import { config } from '../config.js';

// Pool mantiene varias conexiones reutilizables con PostgreSQL.
// Asi cada peticion no tiene que abrir una conexion desde cero.
export const pool = new pg.Pool({
  connectionString: config.urlBaseDatos
});

