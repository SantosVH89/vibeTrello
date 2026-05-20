const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TOKEN_KEY = 'vibetrello_token';

// Guarda el token en localStorage para el MVP local.
export function guardarToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function leerToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function borrarToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Cliente HTTP unico. Adjunta JWT y normaliza los errores de la API.
export async function api(ruta, opciones = {}) {
  const token = leerToken();
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opciones.headers || {})
    }
  });

  const contenido = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(contenido.message || 'No se pudo completar la peticion');
  }

  return contenido;
}

export const apiClient = {
  login: (email, password) => api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  me: () => api('/auth/me'),
  changePassword: (password) => api('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ password })
  }),
  listBoards: () => api('/boards'),
  createBoard: (data) => api('/boards', { method: 'POST', body: JSON.stringify(data) }),
  getBoard: (id) => api(`/boards/${id}`),
  completeBoard: (id) => api(`/boards/${id}/complete`, { method: 'PATCH' }),
  reopenBoard: (id) => api(`/boards/${id}/reopen`, { method: 'PATCH' }),
  deleteBoard: (id) => api(`/boards/${id}`, { method: 'DELETE' }),
  createList: (boardId, data) => api(`/boards/${boardId}/lists`, { method: 'POST', body: JSON.stringify(data) }),
  updateList: (listId, data) => api(`/lists/${listId}`, { method: 'PUT', body: JSON.stringify(data) }),
  reorderLists: (boardId, orderedIds) => api(`/boards/${boardId}/lists/reorder`, {
    method: 'PATCH',
    body: JSON.stringify({ orderedIds })
  }),
  changeListType: (listId, type) => api(`/lists/${listId}/type`, { method: 'PATCH', body: JSON.stringify({ type }) }),
  deleteList: (listId) => api(`/lists/${listId}`, { method: 'DELETE' }),
  createCard: (listId, data) => api(`/lists/${listId}/cards`, { method: 'POST', body: JSON.stringify(data) }),
  updateCard: (cardId, data) => api(`/cards/${cardId}`, { method: 'PUT', body: JSON.stringify(data) }),
  moveCard: (cardId, data) => api(`/cards/${cardId}/move`, { method: 'PATCH', body: JSON.stringify(data) }),
  assignCard: (cardId, assigned_to) => api(`/cards/${cardId}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ assigned_to })
  }),
  completeCard: (cardId) => api(`/cards/${cardId}/complete`, { method: 'PATCH' }),
  reopenCard: (cardId) => api(`/cards/${cardId}/reopen`, { method: 'PATCH' }),
  deleteCard: (cardId) => api(`/cards/${cardId}`, { method: 'DELETE' }),
  getCard: (cardId) => api(`/cards/${cardId}`),
  listUsers: () => api('/users'),
  listAdminUsers: () => api('/admin/users'),
  createAdminUser: (data) => api('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  activateAdminUser: (id) => api(`/admin/users/${id}/activate`, { method: 'PATCH' }),
  deactivateAdminUser: (id) => api(`/admin/users/${id}/deactivate`, { method: 'PATCH' }),
  resetAdminPassword: (id) => api(`/admin/users/${id}/reset-password`, { method: 'PATCH' })
};
