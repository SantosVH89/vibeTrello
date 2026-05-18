import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { ArrowLeft, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiClient } from '../api/client.js';
import { AppShell } from '../components/AppShell.jsx';
import { BoardColumn, BoardColumnPreview } from '../components/BoardColumn.jsx';
import { CardDetailModal } from '../components/CardDetailModal.jsx';
import { EditTextModal } from '../components/EditTextModal.jsx';
import { FormMessage } from '../components/FormMessage.jsx';
import { TaskFormModal } from '../components/TaskFormModal.jsx';
import { TaskCardPreview } from '../components/TaskCard.jsx';

export function BoardPage() {
  const { id } = useParams();
  const [board, setBoard] = useState(null);
  const [listName, setListName] = useState('');
  const [listType, setListType] = useState('active');
  const [error, setError] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [users, setUsers] = useState([]);
  const [creatingInListId, setCreatingInListId] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [activeList, setActiveList] = useState(null);
  const [editingList, setEditingList] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    cargarTablero();
  }, [id]);

  const cardsById = useMemo(() => {
    const mapa = new Map();
    board?.lists?.forEach((list) => list.cards.forEach((card, index) => mapa.set(card.id, { card, list, index })));
    return mapa;
  }, [board]);

  async function cargarTablero() {
    const data = await apiClient.getBoard(id);
    setBoard(data.board);
  }

  async function cargarUsuarios() {
    const data = await apiClient.listUsers();
    setUsers(data.users);
  }

  useEffect(() => {
    cargarUsuarios().catch(() => setUsers([]));
  }, []);

  async function crearLista(event) {
    event.preventDefault();
    setError('');

    try {
      await apiClient.createList(id, { name: listName, type: listType });
      setListName('');
      setListType('active');
      await cargarTablero();
    } catch (err) {
      setError(err.message);
    }
  }

  async function crearTarjeta(datos) {
    if (!creatingInListId) return;
    await apiClient.createCard(creatingInListId, datos);
    await cargarTablero();
  }

  async function abrirTarjeta(cardId) {
    const data = await apiClient.getCard(cardId);
    setSelectedCard(data.card);
  }

  async function asignarTarjeta(assignedTo) {
    if (!selectedCard) return;

    const data = await apiClient.assignCard(selectedCard.id, assignedTo);
    await cargarTablero();
    await abrirTarjeta(data.card.id);
  }

  async function alternarTareaTerminada() {
    if (!selectedCard) return;

    const data = selectedCard.status === 'completed'
      ? await apiClient.reopenCard(selectedCard.id)
      : await apiClient.completeCard(selectedCard.id);

    await cargarTablero();
    await abrirTarjeta(data.card.id);
  }

  async function cambiarTipoLista(list) {
    try {
      await apiClient.changeListType(list.id, list.type === 'completed' ? 'active' : 'completed');
      await cargarTablero();
    } catch (err) {
      setError(err.message);
    }
  }

  async function editarLista(datos) {
    if (!editingList) return;
    await apiClient.updateList(editingList.id, { name: datos.name });
    await cargarTablero();
  }

  async function eliminarLista(list) {
    if (!window.confirm(`Eliminar la lista "${list.name}"?`)) return;
    await apiClient.deleteList(list.id);
    await cargarTablero();
  }

  async function alternarTarjeta(card) {
    if (card.status === 'completed') {
      await apiClient.reopenCard(card.id);
    } else {
      await apiClient.completeCard(card.id);
    }
    await cargarTablero();
    if (selectedCard?.id === card.id) await abrirTarjeta(card.id);
  }

  async function editarTarjeta(datos) {
    if (!editingCard) return;
    await apiClient.updateCard(editingCard.id, {
      title: datos.title,
      description: datos.description
    });
    await cargarTablero();
    if (selectedCard?.id === editingCard.id) await abrirTarjeta(editingCard.id);
  }

  async function eliminarTarjeta(card) {
    if (!window.confirm(`Eliminar la tarea "${card.title}"?`)) return;
    await apiClient.deleteCard(card.id);
    if (selectedCard?.id === card.id) setSelectedCard(null);
    await cargarTablero();
  }

  function iniciarArrastre(event) {
    const tipo = event.active.data.current?.type;
    if (tipo === 'list') {
      const listId = event.active.data.current.listId;
      setActiveList(board.lists.find((list) => list.id === listId) || null);
      setActiveCard(null);
      return;
    }

    const cardId = Number(String(event.active.id).replace('card-', ''));
    setActiveCard(cardsById.get(cardId)?.card || null);
    setActiveList(null);
  }

  async function finalizarArrastre(event) {
    const tipo = event.active.data.current?.type;
    setActiveCard(null);
    setActiveList(null);

    if (tipo === 'list') {
      await finalizarArrastreLista(event);
      return;
    }

    const cardId = Number(String(event.active.id).replace('card-', ''));
    const origen = cardsById.get(cardId);
    if (!origen || !event.over) return;

    const overId = String(event.over.id);
    const targetListId = overId.startsWith('list-')
      ? Number(overId.replace('list-', ''))
      : event.over.data.current?.listId;

    if (!targetListId) return;

    const targetList = board.lists.find((list) => list.id === targetListId);
    const targetPosition = overId.startsWith('card-')
      ? targetList.cards.findIndex((card) => card.id === Number(overId.replace('card-', '')))
      : targetList.cards.length;

    try {
      await apiClient.moveCard(cardId, {
        target_list_id: targetListId,
        target_position: Math.max(0, targetPosition)
      });
      await cargarTablero();
    } catch (err) {
      setError(err.message);
    }
  }

  async function finalizarArrastreLista(event) {
    if (!event.over) return;

    const sourceListId = event.active.data.current?.listId;
    const targetListId = obtenerListIdDesdeDrop(event.over);

    if (!sourceListId || !targetListId || sourceListId === targetListId) return;

    const orderedIds = board.lists.map((list) => list.id);
    const sourceIndex = orderedIds.indexOf(sourceListId);
    const targetIndex = orderedIds.indexOf(targetListId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    orderedIds.splice(sourceIndex, 1);
    orderedIds.splice(targetIndex, 0, sourceListId);

    try {
      await apiClient.reorderLists(id, orderedIds);
      await cargarTablero();
    } catch (err) {
      setError(err.message);
    }
  }

  function obtenerListIdDesdeDrop(over) {
    const overId = String(over.id);
    if (overId.startsWith('list-')) return Number(overId.replace('list-', ''));
    if (overId.startsWith('draggable-list-')) return Number(overId.replace('draggable-list-', ''));
    if (overId.startsWith('card-')) return over.data.current?.listId;
    return over.data.current?.listId;
  }

  if (!board) {
    return <AppShell><div className="text-sm text-slate-600">Cargando tablero...</div></AppShell>;
  }

  return (
    <AppShell>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-tinta">
            <ArrowLeft className="h-4 w-4" />
            Tableros
          </Link>
          <h1 className="text-2xl font-semibold text-tinta">{board.name}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">{board.description || 'Sin descripcion'}</p>
        </div>

        <form onSubmit={crearLista} className="flex w-full flex-wrap gap-2 sm:w-auto">
          <input
            value={listName}
            onChange={(event) => setListName(event.target.value)}
            className="min-w-0 flex-1 rounded border border-linea px-3 py-2 text-sm outline-none focus:border-acento sm:w-56"
            placeholder="Nueva lista"
            required
          />
          <select
            value={listType}
            onChange={(event) => setListType(event.target.value)}
            className="rounded border border-linea bg-white px-3 py-2 text-sm outline-none focus:border-acento"
            title="Tipo de lista"
          >
            <option value="active">Activa</option>
            <option value="completed">Completada</option>
          </select>
          <button className="inline-flex items-center gap-2 rounded bg-acento px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Crear
          </button>
        </form>
      </div>

      <FormMessage>{error}</FormMessage>

      <DndContext
        sensors={sensors}
        onDragStart={iniciarArrastre}
        onDragCancel={() => {
          setActiveCard(null);
          setActiveList(null);
        }}
        onDragEnd={finalizarArrastre}
      >
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {board.lists.map((list) => (
            <BoardColumn
              key={list.id}
              list={list}
              onCreateCard={setCreatingInListId}
              onOpenCard={abrirTarjeta}
              onChangeType={cambiarTipoLista}
              onEditList={setEditingList}
              onDeleteList={eliminarLista}
              onToggleCard={alternarTarjeta}
              onEditCard={setEditingCard}
              onDeleteCard={eliminarTarjeta}
            />
          ))}
        </div>
        <DragOverlay>
          {activeCard ? <TaskCardPreview card={activeCard} /> : null}
          {activeList ? <BoardColumnPreview list={activeList} /> : null}
        </DragOverlay>
      </DndContext>

      <TaskFormModal
        open={Boolean(creatingInListId)}
        listName={board.lists.find((list) => list.id === creatingInListId)?.name || ''}
        users={users}
        onClose={() => setCreatingInListId(null)}
        onSubmit={crearTarjeta}
      />

      <CardDetailModal
        card={selectedCard}
        users={users}
        onAssign={asignarTarjeta}
        onToggleComplete={alternarTareaTerminada}
        onClose={() => setSelectedCard(null)}
      />

      <EditTextModal
        open={Boolean(editingList)}
        title="Editar lista"
        initialName={editingList?.name}
        onClose={() => setEditingList(null)}
        onSubmit={editarLista}
      />

      <EditTextModal
        open={Boolean(editingCard)}
        title="Editar tarea"
        initialName={editingCard?.title}
        initialDescription={editingCard?.description}
        descriptionEnabled
        onClose={() => setEditingCard(null)}
        onSubmit={editarTarjeta}
      />
    </AppShell>
  );
}
