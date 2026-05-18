import { LogOut, LayoutDashboard, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function AppShell({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-fondo">
      <header className="border-b border-linea bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <nav className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 font-semibold text-tinta">
              <LayoutDashboard className="h-5 w-5 text-acento" />
              VibeTrello
            </Link>
            {user?.role === 'admin' ? (
              <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-acento">
                <UsersRound className="h-4 w-4" />
                Usuarios
              </Link>
            ) : null}
          </nav>

          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-600 sm:inline">{user?.name}</span>
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-9 w-9 items-center justify-center rounded border border-linea bg-white text-slate-700 hover:bg-slate-50"
              title="Cerrar sesion"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-6">{children}</main>
    </div>
  );
}
