import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { App } from './App.jsx';
import './index.css';

// React Router necesita conocer la carpeta publica donde vive la app.
// En local sera "/" y en Coolify sera "/vibeTrello/".
const rutaBase = import.meta.env.BASE_URL;

// Punto de entrada del frontend. React monta la app dentro de #root.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={rutaBase}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
