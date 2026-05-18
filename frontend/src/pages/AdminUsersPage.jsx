import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { KeyRound, Plus, Power, PowerOff } from 'lucide-react';
import { apiClient } from '../api/client.js';
import { AppShell } from '../components/AppShell.jsx';
import { FormMessage } from '../components/FormMessage.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', role: 'user' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      cargarUsuarios();
    }
  }, [user]);

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  async function cargarUsuarios() {
    const data = await apiClient.listAdminUsers();
    setUsers(data.users);
  }

  async function crearUsuario(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      // No enviamos password: el backend aplicara la temporal 12345678.
      await apiClient.createAdminUser({
        name: form.name,
        email: form.email,
        role: form.role,
        is_active: true
      });
      setForm({ name: '', email: '', role: 'user' });
      setSuccess('Usuario creado con password temporal 12345678.');
      await cargarUsuarios();
    } catch (err) {
      setError(err.message);
    }
  }

  async function cambiarEstado(usuario) {
    setError('');
    setSuccess('');

    try {
      if (usuario.is_active) {
        await apiClient.deactivateAdminUser(usuario.id);
        setSuccess('Usuario desactivado.');
      } else {
        await apiClient.activateAdminUser(usuario.id);
        setSuccess('Usuario activado.');
      }
      await cargarUsuarios();
    } catch (err) {
      setError(err.message);
    }
  }

  async function resetearPassword(usuario) {
    setError('');
    setSuccess('');

    try {
      await apiClient.resetAdminPassword(usuario.id);
      setSuccess(`Password temporal restaurada para ${usuario.name}: 12345678.`);
      await cargarUsuarios();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <form onSubmit={crearUsuario} className="rounded border border-linea bg-white p-4 shadow-sm">
          <h1 className="text-lg font-semibold text-tinta">Crear usuario</h1>
          <p className="mt-1 text-sm text-slate-600">El primer acceso obligara a cambiar la password temporal.</p>

          <div className="mt-5 space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Nombre</span>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="mt-1 w-full rounded border border-linea px-3 py-2 text-sm outline-none focus:border-acento"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="mt-1 w-full rounded border border-linea px-3 py-2 text-sm outline-none focus:border-acento"
                type="email"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Rol</span>
              <select
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
                className="mt-1 w-full rounded border border-linea bg-white px-3 py-2 text-sm outline-none focus:border-acento"
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </label>

            <FormMessage>{error}</FormMessage>
            <FormMessage type="success">{success}</FormMessage>

            <button className="inline-flex w-full items-center justify-center gap-2 rounded bg-acento px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Crear con password 12345678
            </button>
          </div>
        </form>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-tinta">Usuarios del sistema</h2>
            <span className="text-sm text-slate-500">{users.length}</span>
          </div>

          <div className="overflow-hidden rounded border border-linea bg-white shadow-sm">
            <div className="grid grid-cols-[1.2fr_1.4fr_110px_120px_160px] gap-3 border-b border-linea bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500">
              <span>Nombre</span>
              <span>Email</span>
              <span>Rol</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>

            {users.map((usuario) => (
              <div key={usuario.id} className="grid grid-cols-[1.2fr_1.4fr_110px_120px_160px] items-center gap-3 border-b border-linea px-4 py-3 text-sm last:border-b-0">
                <span className="font-medium text-tinta">{usuario.name}</span>
                <span className="truncate text-slate-600">{usuario.email}</span>
                <span className="text-slate-600">{usuario.role === 'admin' ? 'Admin' : 'Usuario'}</span>
                <span className={usuario.is_active ? 'text-blue-700' : 'text-slate-500'}>
                  {usuario.is_active ? 'Activo' : 'Inactivo'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => resetearPassword(usuario)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded border border-linea hover:bg-slate-50"
                    title="Restaurar password temporal"
                  >
                    <KeyRound className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => cambiarEstado(usuario)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded border border-linea hover:bg-slate-50"
                    title={usuario.is_active ? 'Desactivar usuario' : 'Activar usuario'}
                  >
                    {usuario.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
