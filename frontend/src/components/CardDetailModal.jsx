import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, X } from 'lucide-react';

export function CardDetailModal({ card, users = [], onAssign, onToggleComplete, onClose }) {
  const [assignedToIds, setAssignedToIds] = useState(['']);

  const total = card?.subtasks?.length || 0;
  const completadas = card?.subtasks?.filter((subtask) => subtask.status === 'completed').length || 0;

  // Al abrir otra tarea sincronizamos los selectores con sus responsables actuales.
  useEffect(() => {
    if (!card) return;
    setAssignedToIds(card.assigned_to_ids?.length ? card.assigned_to_ids.map(String) : ['']);
  }, [card]);

  if (!card) return null;

  function actualizarAsignado(index, value) {
    const nuevosAsignados = [...assignedToIds];
    nuevosAsignados[index] = value;
    setAssignedToIds(nuevosAsignados);
    onAssign?.(limpiarAsignados(nuevosAsignados));
  }

  function quitarAsignado(index) {
    const nuevosAsignados = assignedToIds.filter((_, posicion) => posicion !== index);
    setAssignedToIds(nuevosAsignados.length ? nuevosAsignados : ['']);
    onAssign?.(limpiarAsignados(nuevosAsignados));
  }

  function anadirAsignado() {
    setAssignedToIds([...assignedToIds, '']);
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/35 p-4">
      <div className="mx-auto max-h-[92vh] max-w-3xl overflow-y-auto rounded border border-linea bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-linea p-5">
          <div>
            <h2 className="text-xl font-semibold text-tinta">{card.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{card.board_name} - {card.list_name}</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded hover:bg-slate-100" title="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-[1fr_240px]">
          <div className="space-y-5">
            <section>
              <h3 className="text-sm font-semibold text-tinta">Descripcion</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{card.description || 'Sin descripcion'}</p>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-tinta">Subtareas</h3>
              <p className="mt-1 text-xs text-slate-500">{completadas}/{total} completadas</p>
              <div className="mt-3 space-y-2">
                {(card.subtasks || []).map((subtask) => (
                  <div key={subtask.id} className="rounded border border-linea px-3 py-2 text-sm">
                    <span className={subtask.status === 'completed' ? 'text-blue-700' : 'text-tinta'}>{subtask.title}</span>
                    <span className="ml-2 text-xs text-slate-500">{subtask.assigned_to_name || 'Sin asignar'}</span>
                  </div>
                ))}
                {!total ? <p className="text-sm text-slate-500">Todavia no hay subtareas.</p> : null}
              </div>
            </section>
          </div>

          <aside className="space-y-3 text-sm">
            <Info label="Estado" value={card.status === 'completed' ? 'Completada' : 'Activa'} />
            <button
              type="button"
              onClick={onToggleComplete}
              className={`inline-flex w-full items-center justify-center gap-2 rounded border px-3 py-2 text-sm font-medium ${card.status === 'completed' ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 'border-blue-600 bg-acento text-white hover:bg-blue-700'}`}
            >
              {card.status === 'completed' ? <Circle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              {card.status === 'completed' ? 'Reabrir tarea' : 'Marcar terminada'}
            </button>
            <Info label="Creada por" value={card.created_by_name} />
            <div className="rounded border border-linea p-3">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs uppercase text-slate-500">Asignada a</label>
                <button
                  type="button"
                  onClick={anadirAsignado}
                  className="inline-flex h-7 w-7 items-center justify-center rounded border border-blue-200 text-blue-700 hover:bg-blue-50"
                  title="Anadir otra persona"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-2 space-y-2">
                {assignedToIds.map((assignedTo, index) => (
                  <div key={index} className="flex gap-2">
                    <select
                      value={assignedTo}
                      onChange={(event) => actualizarAsignado(index, event.target.value)}
                      className="min-w-0 flex-1 rounded border border-linea bg-white px-2 py-2 text-sm outline-none focus:border-acento"
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
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded border border-red-200 text-red-700 hover:bg-red-50"
                        title="Quitar persona"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <section className="border-t border-linea p-5">
          <h3 className="text-sm font-semibold text-tinta">Actividad</h3>
          <div className="mt-3 space-y-2">
            {(card.activity || []).map((item) => (
              <div key={item.id} className="rounded border border-linea px-3 py-2 text-xs text-slate-600">
                <strong className="text-tinta">{item.user_name || 'Sistema'}</strong> - {item.action} - {new Date(item.created_at).toLocaleString()}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function limpiarAsignados(assignedToIds) {
  return [...new Set(assignedToIds.filter(Boolean).map(Number))];
}

function Info({ label, value }) {
  return (
    <div className="rounded border border-linea p-3">
      <div className="text-xs uppercase text-slate-500">{label}</div>
      <div className="mt-1 font-medium text-tinta">{value}</div>
    </div>
  );
}
