import { crearError } from './http-error.js';

// Comprueba que un texto obligatorio tenga contenido real.
export function textoObligatorio(valor, nombreCampo) {
  if (typeof valor !== 'string' || valor.trim().length === 0) {
    throw crearError(`${nombreCampo} es obligatorio`);
  }

  return valor.trim();
}

// Comprueba emails de forma simple antes de consultar la base de datos.
export function emailValido(email) {
  const emailNormalizado = textoObligatorio(email, 'email').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
    throw crearError('El email no tiene un formato valido');
  }

  return emailNormalizado;
}

// Convierte parametros de URL a numero entero.
export function idNumerico(valor, nombreCampo = 'id') {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw crearError(`${nombreCampo} debe ser un numero valido`);
  }

  return numero;
}

// Valida listas de opciones cerradas, por ejemplo role admin/user.
export function opcionValida(valor, opciones, nombreCampo) {
  if (!opciones.includes(valor)) {
    throw crearError(`${nombreCampo} debe ser uno de: ${opciones.join(', ')}`);
  }

  return valor;
}

// Normaliza posiciones para ordenacion visual.
export function posicionValida(valor, nombreCampo = 'position') {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < 0) {
    throw crearError(`${nombreCampo} debe ser un numero entero igual o mayor que 0`);
  }

  return numero;
}

