import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { config } from './config.js';
import { manejarErrores } from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import boardsRoutes from './routes/boards.routes.js';
import listsRoutes from './routes/lists.routes.js';
import cardsRoutes from './routes/cards.routes.js';
import subtasksRoutes from './routes/subtasks.routes.js';
import auditRoutes from './routes/audit.routes.js';

export const app = express();

// Middlewares generales: JSON para APIs y CORS para aceptar el frontend local.
app.use(cors({ origin: config.origenCors }));
app.use(express.json());
app.use(morgan('dev'));

// Ruta simple para comprobar que el backend esta vivo.
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Todas las rutas internas de la API se agrupan bajo /api.
app.use('/api/auth', authRoutes);
app.use('/api', usersRoutes);
app.use('/api', boardsRoutes);
app.use('/api', listsRoutes);
app.use('/api', cardsRoutes);
app.use('/api', subtasksRoutes);
app.use('/api', auditRoutes);

// Si ninguna ruta coincide, damos un mensaje claro.
app.use((_req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

app.use(manejarErrores);
