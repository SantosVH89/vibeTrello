import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { FormMessage } from '../components/FormMessage.jsx';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@local.test');
  const [password, setPassword] = useState('12345678');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user && !user.must_change_password) return <Navigate to="/" replace />;
  if (user && user.must_change_password) return <Navigate to="/change-password" replace />;

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const usuario = await login(email, password);
      navigate(usuario.must_change_password ? '/change-password' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-fondo px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded border border-linea bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-tinta">VibeTrello</h1>
          <p className="mt-1 text-sm text-slate-600">Acceso interno a proyectos y tareas.</p>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded border border-linea px-3 py-2 outline-none focus:border-acento"
              type="email"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded border border-linea px-3 py-2 outline-none focus:border-acento"
              type="password"
              required
            />
          </label>

          <FormMessage>{error}</FormMessage>

          <button
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded bg-acento px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" />
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
      </form>
    </main>
  );
}
