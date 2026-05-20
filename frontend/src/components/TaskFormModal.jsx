import { useEffect, useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { FormMessage } from './FormMessage.jsx';

export function TaskFormModal({ open, listName, users, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToIds, setAssignedToIds] = useState(['']);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Cada vez que se abre el modal empezamos con el formulario limpio.
  useEffect(() => {
    if (!open) return;
    setTitle('');
    setDescription('');
    setAssignedToIds(['']);
    setError('');
  }, [open]);

  if (!open) return null;

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      await onSubmit({
        title,
        description,
        assigned_to_ids: limpiarAsignados(assignedToIds)
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
      <form onSubmit={submit} className="w-full max-w-lg rounded border border-linea bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-linea p-5">
          <div>
            <h2 className="text-lg font-semibold text-tinta">Nueva tarea</h2>
            <p className="mt-1 text-sm text-slate-600">{listName}</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded hover:bg-slate-100" title="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Titulo</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1 w-full rounded border border-linea px-3 py-2 outline-none focus:border-acento"
              placeholder="Ej. Preparar propuesta"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Descripcion</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-1 h-24 w-full resize-none rounded border border-linea px-3 py-2 outline-none focus:border-acento"
              placeholder="Detalle breve de la tarea"
            />
          </label>

          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-700">Asignar a</span>
              <button
                type="button"
                onClick={() => setAssignedToIds([...assignedToIds, ''])}
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-blue-200 text-blue-700 hover:bg-blue-50"
                title="Anadir otra persona"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2 space-y-2">
              {assignedToIds.map((assignedTo, index) => (
                <div key={index} className="flex gap-2">
                  <select
                    value={assignedTo}
                    onChange={(event) => actualizarAsignado(index, event.target.value)}
                    className="min-w-0 flex-1 rounded border border-linea bg-white px-3 py-2 outline-none focus:border-acento"
                  >
                    <option value="">Sin asignar</option>
                    {users.map((user) => (
                      <option
                        key={user.id}
                        value={user.id}
                        disabled={assignedToIds.includes(String(user.id)) && assignedTo !== String(user.id)}
                      >
                        {user.name}
                      </option>
                    ))}
                  </select>

                  {assignedToIds.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => quitarAsignado(index)}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded border border-red-200 text-red-700 hover:bg-red-50"
                      title="Quitar persona"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <FormMessage>{error}</FormMessage>
        </div>

        <div className="flex justify-end gap-2 border-t border-linea p-5">
          <button type="button" onClick={onClose} className="rounded border border-linea px-4 py-2 text-sm font-medium hover:bg-slate-50">
            Cancelar
          </button>
          <button disabled={saving} className="inline-flex items-center gap-2 rounded bg-acento px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
            <Plus className="h-4 w-4" />
            {saving ? 'Creando...' : 'Crear tarea'}
          </button>
        </div>
      </form>
    </div>
  );

  function actualizarAsignado(index, value) {
    const nuevosAsignados = [...assignedToIds];
    nuevosAsignados[index] = value;
    setAssignedToIds(nuevosAsignados);
  }

  function quitarAsignado(index) {
    const nuevosAsignados = assignedToIds.filter((_, posicion) => posicion !== index);
    setAssignedToIds(nuevosAsignados.length ? nuevosAsignados : ['']);
  }
}

function limpiarAsignados(assignedToIds) {
  return [...new Set(assignedToIds.filter(Boolean).map(Number))];
}
