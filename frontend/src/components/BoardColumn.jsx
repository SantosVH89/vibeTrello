import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CheckCircle2, Circle, GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { TaskCard } from './TaskCard.jsx';

export function BoardColumn({
  list,
  onCreateCard,
  onOpenCard,
  onChangeType,
  onEditList,
  onDeleteList,
  onToggleCard,
  onEditCard,
  onDeleteCard
}) {
  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: `list-${list.id}`,
    data: { type: 'list-drop', listId: list.id }
  });
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableNodeRef,
    isDragging
  } = useDraggable({
    id: `draggable-list-${list.id}`,
    data: { type: 'list', listId: list.id }
  });

  // La columna completa es arrastrable, pero solo el asa de la cabecera inicia el movimiento.
  function setNodeRef(node) {
    setDroppableNodeRef(node);
    setDraggableNodeRef(node);
  }

  const completada = list.type === 'completed';

  return (
    <section
      ref={setNodeRef}
      className={`flex h-[480px] w-full flex-col rounded border shadow-sm ${isDragging ? 'opacity-35' : ''} ${isOver ? 'border-acento bg-blue-100' : completada ? 'border-blue-500 bg-blue-100 ring-2 ring-blue-200' : 'border-blue-100 bg-blue-50/60'}`}
    >
      <div className={`flex items-center justify-between gap-2 border-b px-3 py-3 ${completada ? 'border-blue-300 bg-blue-200/60' : 'border-blue-100'}`}>
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-blue-500 hover:bg-blue-100"
          title="Mover lista"
          aria-label="Mover lista"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-tinta">{list.name}</h3>
          <p className={`text-xs ${completada ? 'font-medium text-blue-800' : 'text-slate-500'}`}>
            {list.cards.length} tareas {completada ? 'completadas' : ''}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <IconButton title={completada ? 'Reabrir lista' : 'Marcar lista como completada'} onClick={() => onChangeType(list)}>
            {completada ? <CheckCircle2 className="h-4 w-4 text-blue-700" /> : <Circle className="h-4 w-4 text-blue-600" />}
          </IconButton>
          <IconButton title="Editar lista" onClick={() => onEditList(list)}>
            <Pencil className="h-4 w-4 text-blue-600" />
          </IconButton>
          <IconButton title="Eliminar lista" onClick={() => onDeleteList(list)}>
            <Trash2 className="h-4 w-4 text-red-600" />
          </IconButton>
        </div>
      </div>

      <div className="max-h-[344px] flex-1 space-y-2 overflow-y-auto p-3">
        {list.cards.map((card) => (
          <TaskCard
            key={card.id}
            card={card}
            listId={list.id}
            onOpen={onOpenCard}
            onToggleComplete={onToggleCard}
            onEdit={onEditCard}
            onDelete={onDeleteCard}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => onCreateCard(list.id)}
        className="m-3 inline-flex items-center justify-center gap-2 rounded border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
      >
        <Plus className="h-4 w-4" />
        Nueva tarea
      </button>
    </section>
  );
}

export function BoardColumnPreview({ list }) {
  const completada = list.type === 'completed';

  return (
    <section className={`flex h-72 w-80 flex-col rounded border p-3 shadow-2xl ${completada ? 'border-blue-500 bg-blue-100' : 'border-blue-300 bg-blue-50'}`}>
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-blue-500" />
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-tinta">{list.name}</h3>
          <p className="text-xs text-slate-500">{list.cards.length} tareas</p>
        </div>
      </div>
    </section>
  );
}

function IconButton({ title, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-white hover:bg-blue-50"
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}
