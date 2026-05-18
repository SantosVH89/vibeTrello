import dotenv from 'dotenv';

// Cargamos variables de entorno desde backend/.env si existe.
dotenv.config();

// Toda la configuracion se agrupa aqui para evitar valores sueltos por el codigo.
export const config = {
  puerto: Number(process.env.PORT || 4000),
  origenCors: process.env.CORS_ORIGIN || 'http://localhost:5173',
  urlBaseDatos: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/VibeTrelloCodex',
  secretoJwt: process.env.JWT_SECRET || 'desarrollo-cambiar-este-secreto',
  duracionJwt: process.env.JWT_EXPIRES_IN || '8h',
  passwordTemporal: process.env.TEMPORARY_PASSWORD || '12345678'
};
