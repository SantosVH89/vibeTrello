import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { apiClient } from '../api/client.js';
import { AppShell } from '../components/AppShell.jsx';
import { BoardCard } from '../components/BoardCard.jsx';
import { FormMessage } from '../components/FormMessage.jsx';

export function DashboardPage() {
  const [boards, setBoards] = useState({ active: [], completed: [] });
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    cargarTableros();
  }, []);

  async function cargarTableros() {
    setBoards(await apiClient.listBoards());
  }

  async function crearTablero(event) {
    event.preventDefault();
    setError('');

    try {
      await apiClient.createBoard({ name, description });
      setName('');
      setDescription('');
      await cargarTableros();
    } catch (err) {
      setError(err.message);
    }
  }

  async function alternarEstado(board) {
    if (board.status === 'completed') {
      await apiClient.reopenBoard(board.id);
    } else {
      await apiClient.completeBoard(board.id);
    }

    await cargarTableros();
  }

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <form onSubmit={crearTablero} className="rounded border border-linea bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-tinta">Nuevo tablero</h2>
          <div className="mt-4 space-y-3">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded border border-linea px-3 py-2 text-sm outline-none focus:border-acento"
              placeholder="Nombre del proyecto"
              required
            />
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="h-24 w-full resize-none rounded border border-linea px-3 py-2 text-sm outline-none focus:border-acento"
              placeholder="Descripcion breve"
            />
            <FormMessage>{error}</FormMessage>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded bg-acento px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Crear tablero
            </button>
          </div>
        </form>

        <div className="space-y-8">
          <BoardSection title="Trabajo activo" boards={boards.active} onToggle={alternarEstado} />
          <BoardSection title="Trabajo completado" boards={boards.completed} onToggle={alternarEstado} muted />
        </div>
      </div>
    </AppShell>
  );
}

function BoardSection({ title, boards, onToggle, muted = false }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-tinta">{title}</h2>
        <span className="text-sm text-slate-500">{boards.length}</span>
      </div>

      {boards.length ? (
        <div className={`grid gap-3 md:grid-cols-2 xl:grid-cols-3 ${muted ? 'opacity-80' : ''}`}>
          {boards.map((board) => <BoardCard key={board.id} board={board} onToggle={onToggle} />)}
        </div>
      ) : (
        <div className="rounded border border-dashed border-linea bg-white px-4 py-8 text-center text-sm text-slate-500">
          No hay tableros en esta zona.
        </div>
      )}
    </section>
  );
}
