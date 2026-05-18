import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { FormMessage } from '../components/FormMessage.jsx';

export function ChangePasswordPage() {
  const { changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');

    try {
      await changePassword(password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-fondo px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded border border-linea bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-tinta">Cambia la password temporal</h1>
        <p className="mt-1 text-sm text-slate-600">Necesitas una password nueva de al menos 8 caracteres.</p>

        <label className="mt-6 block">
          <span className="text-sm font-medium text-slate-700">Nueva password</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded border border-linea px-3 py-2 outline-none focus:border-acento"
            type="password"
            minLength={8}
            required
          />
        </label>

        <div className="mt-4">
          <FormMessage>{error}</FormMessage>
        </div>

        <div className="mt-5 flex gap-2">
          <button className="inline-flex flex-1 items-center justify-center gap-2 rounded bg-acento px-4 py-2 font-medium text-white hover:bg-blue-700">
            <KeyRound className="h-4 w-4" />
            Guardar
          </button>
          <button type="button" onClick={logout} className="rounded border border-linea px-4 py-2 text-sm hover:bg-slate-50">
            Salir
          </button>
        </div>
      </form>
    </main>
  );
}
