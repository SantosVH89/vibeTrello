// Evita repetir try/catch en cada controlador.
export function asyncHandler(controlador) {
  return (req, res, next) => {
    Promise.resolve(controlador(req, res, next)).catch(next);
  };
}

