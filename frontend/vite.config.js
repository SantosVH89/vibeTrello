import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Configuracion de Vite para React.
// El plugin activa el runtime JSX automatico y la recarga rapida en desarrollo.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    strictPort: true
  }
});
