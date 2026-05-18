import { useEffect, useState } from 'react';
import { X, Save } from 'lucide-react';
import { FormMessage } from './FormMessage.jsx';

export function EditTextModal({ open, title, initialName = '', initialDescription = '', descriptionEnabled = false, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Cuando abrimos el modal cargamos los datos actuales del elemento.
  useEffect(() => {
    if (!open) return;
    setName(initialName || '');
    setDescription(initialDescription || '');
    setError('');
  }, [open, initialName, initialDescription]);

  if (!open) return null;

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      await onSubmit({ name, title: name, description });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded border border-linea bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-linea p-5">
          <h2 className="text-lg font-semibold text-tinta">{title}</h2>
          <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded hover:bg-blue-50" title="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nombre</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded border border-linea px-3 py-2 outline-none focus:border-acento"
              required
            />
          </label>

          {descriptionEnabled ? (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Descripcion</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="mt-1 h-24 w-full resize-none rounded border border-linea px-3 py-2 outline-none focus:border-acento"
              />
            </label>
          ) : null}

          <FormMessage>{error}</FormMessage>
        </div>

        <div className="flex justify-end gap-2 border-t border-linea p-5">
          <button type="button" onClick={onClose} className="rounded border border-linea px-4 py-2 text-sm font-medium hover:bg-blue-50">
            Cancelar
          </button>
          <button disabled={saving} className="inline-flex items-center gap-2 rounded bg-acento px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}

