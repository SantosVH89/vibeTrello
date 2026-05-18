import { app } from './app.js';
import { config } from './config.js';

// Punto de entrada del backend. Levanta Express en el puerto configurado.
app.listen(config.puerto, () => {
  console.log(`Backend VibeTrello escuchando en http://localhost:${config.puerto}`);
});

