import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CheckCircle2, Circle, GripVertical, Pencil, Trash2, UserRound } from 'lucide-react';

export function TaskCard({ card, listId, onOpen, onToggleComplete, onEdit, onDelete, overlay = false }) {
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableNodeRef,
    isDragging
  } = useDraggable({
    id: `card-${card.id}`,
    data: { cardId: card.id, listId }
  });

  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: `card-${card.id}`,
    data: { cardId: card.id, listId }
  });

  // Un mismo nodo hace de elemento arrastrable y de destino de caida.
  function setNodeRef(node) {
    setDraggableNodeRef(node);
    setDroppableNodeRef(node);
  }

  const completada = card.status === 'completed';

  return (
    <article
      ref={setNodeRef}
      className={`rounded border p-3 shadow-sm ${isDragging && !overlay ? 'opacity-35' : ''} ${isOver && !overlay ? 'ring-2 ring-blue-400' : ''} ${overlay ? 'w-72 cursor-grabbing border-blue-500 bg-white shadow-2xl' : completada ? 'border-blue-300 bg-blue-50' : 'border-linea bg-white'}`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-100"
          title="Arrastrar tarea"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button type="button" onClick={() => onOpen(card.id)} className="min-w-0 flex-1 text-left">
          <h4 className="break-words text-sm font-semibold text-tinta">{card.title}</h4>
          {card.description ? <p className="mt-1 line-clamp-2 text-xs text-slate-600">{card.description}</p> : null}
        </button>

        {!overlay ? (
          <div className="flex shrink-0 items-center gap-1">
            <IconButton
              title={completada ? 'Reabrir tarea' : 'Marcar tarea como completada'}
              onClick={() => onToggleComplete(card)}
            >
              {completada ? <CheckCircle2 className="h-4 w-4 text-blue-700" /> : <Circle className="h-4 w-4 text-blue-600" />}
            </IconButton>
            <IconButton title="Editar tarea" onClick={() => onEdit(card)}>
              <Pencil className="h-4 w-4 text-blue-600" />
            </IconButton>
            <IconButton title="Eliminar tarea" onClick={() => onDelete(card)}>
              <Trash2 className="h-4 w-4 text-red-600" />
            </IconButton>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500">
        <span className="inline-flex min-w-0 items-center gap-1">
          <UserRound className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{card.assigned_to_name || 'Sin asignar'}</span>
        </span>

        <span className="inline-flex items-center gap-1">
          {completada ? <CheckCircle2 className="h-3.5 w-3.5 text-blue-700" /> : null}
          {card.subtasks_total ? `${card.subtasks_completed}/${card.subtasks_total}` : '0/0'}
        </span>
      </div>
    </article>
  );
}

export function TaskCardPreview({ card }) {
  return (
    <article className="w-72 rounded border border-blue-500 bg-white p-3 shadow-2xl">
      <div className="flex items-start gap-2">
        <GripVertical className="mt-1 h-4 w-4 shrink-0 text-blue-500" />
        <div className="min-w-0 flex-1">
          <h4 className="break-words text-sm font-semibold text-tinta">{card.title}</h4>
          {card.description ? <p className="mt-1 line-clamp-2 text-xs text-slate-600">{card.description}</p> : null}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500">
        <span className="inline-flex min-w-0 items-center gap-1">
          <UserRound className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{card.assigned_to_name || 'Sin asignar'}</span>
        </span>
        <span>{card.subtasks_total ? `${card.subtasks_completed}/${card.subtasks_total}` : '0/0'}</span>
      </div>
    </article>
  );
}

function IconButton({ title, onClick, children }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="inline-flex h-7 w-7 items-center justify-center rounded border border-blue-100 bg-white hover:bg-blue-50"
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}
