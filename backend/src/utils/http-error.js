// Crea errores con codigo HTTP para que el middleware final sepa que responder.
export function crearError(mensaje, estado = 400) {
  const error = new Error(mensaje);
  error.status = estado;
  return error;
}

