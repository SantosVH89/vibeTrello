import { useState } from 'react';
import { CheckCircle2, Circle, MoreHorizontal, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function BoardCard({ board, onToggle, onDelete, canDelete = false }) {
  const completado = board.status === 'completed';
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);

  function pedirConfirmacion() {
    setConfirmandoBorrado(true);
  }

  function cancelarBorrado() {
    setConfirmandoBorrado(false);
  }

  async function confirmarBorrado() {
    // El backend hace el borrado logico y verifica que el usuario sea admin.
    await onDelete(board);
    setConfirmandoBorrado(false);
  }

  return (
    <div className="rounded border border-linea bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/boards/${board.id}`} className="min-w-0">
          <h3 className="truncate text-base font-semibold text-tinta">{board.name}</h3>
          <p className="mt-1 line-clamp-2 min-h-10 text-sm text-slate-600">
            {board.description || 'Sin descripcion'}
          </p>
        </Link>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => onToggle(board)}
            className="inline-flex h-9 w-9 items-center justify-center rounded border border-linea hover:bg-slate-50"
            title={completado ? 'Reabrir tablero' : 'Completar tablero'}
          >
            {completado ? <CheckCircle2 className="h-4 w-4 text-blue-700" /> : <Circle className="h-4 w-4 text-slate-600" />}
          </button>

          {canDelete ? (
            <button
              type="button"
              onClick={pedirConfirmacion}
              className="inline-flex h-9 w-9 items-center justify-center rounded border border-red-200 text-red-700 hover:bg-red-50"
              title="Eliminar tablero"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {confirmandoBorrado ? (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <p>Eliminar este tablero lo ocultara de la app.</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={confirmarBorrado}
              className="rounded bg-red-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-800"
            >
              Eliminar
            </button>
            <button
              type="button"
              onClick={cancelarBorrado}
              className="rounded border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>{completado ? 'Completado' : 'Activo'}</span>
        <MoreHorizontal className="h-4 w-4" />
      </div>
    </div>
  );
}
