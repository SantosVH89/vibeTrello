import { CheckCircle2, Circle, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

export function BoardCard({ board, onToggle }) {
  const completado = board.status === 'completed';

  return (
    <div className="rounded border border-linea bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/boards/${board.id}`} className="min-w-0">
          <h3 className="truncate text-base font-semibold text-tinta">{board.name}</h3>
          <p className="mt-1 line-clamp-2 min-h-10 text-sm text-slate-600">
            {board.description || 'Sin descripcion'}
          </p>
        </Link>
        <button
          type="button"
          onClick={() => onToggle(board)}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded border border-linea hover:bg-slate-50"
          title={completado ? 'Reabrir tablero' : 'Completar tablero'}
        >
          {completado ? <CheckCircle2 className="h-4 w-4 text-blue-700" /> : <Circle className="h-4 w-4 text-slate-600" />}
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>{completado ? 'Completado' : 'Activo'}</span>
        <MoreHorizontal className="h-4 w-4" />
      </div>
    </div>
  );
}
