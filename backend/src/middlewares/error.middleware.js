// Respuesta comun para errores. Asi el frontend siempre recibe { message }.
export function manejarErrores(error, _req, res, _next) {
  const estado = error.status || 500;

  if (estado >= 500) {
    console.error(error);
  }

  res.status(estado).json({
    message: error.message || 'Error interno del servidor'
  });
}

