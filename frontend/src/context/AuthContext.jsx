import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient, borrarToken, guardarToken, leerToken } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(leerToken()));

  // Al recargar la pagina, intenta recuperar el usuario usando el token guardado.
  useEffect(() => {
    if (!leerToken()) return;

    apiClient.me()
      .then((data) => setUser(data.user))
      .catch(() => borrarToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const data = await apiClient.login(email, password);
    guardarToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function changePassword(password) {
    const data = await apiClient.changePassword(password);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    borrarToken();
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, logout, changePassword }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

