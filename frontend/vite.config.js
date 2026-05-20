import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Configuracion de Vite para React.
// El plugin activa el runtime JSX automatico y la recarga rapida en desarrollo.
export default defineConfig({
  // En local se sirve desde /.
  // En servidor Coolify se puede compilar con /vibeTrello/ para colgar la app de una ruta concreta.
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  server: {
    port: 5175,
    strictPort: true
  }
});
