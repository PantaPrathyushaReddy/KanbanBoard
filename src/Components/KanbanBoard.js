import React, { useReducer, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Initial state
const initialState = {
  tasks: {
    todo: [],
    inprogress: [],
    done: []
  }
};

// Reducer
function kanbanReducer(state, action) {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: {
          ...state.tasks,
          todo: [...state.tasks.todo, { id: Date.now().toString(), title: action.payload.title, description: action.payload.description }]
        }
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.payload.status]: state.tasks[action.payload.status].filter(task => task.id !== action.payload.id)
        }
      };
    case 'MOVE_TASK':
      const { id, fromStatus, toStatus } = action.payload;
      const task = state.tasks[fromStatus].find(t => t.id === id);
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [fromStatus]: state.tasks[fromStatus].filter(t => t.id !== id),
          [toStatus]: [...state.tasks[toStatus], task]
        }
      };
    case 'REORDER_TASKS':
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.payload.status]: arrayMove(state.tasks[action.payload.status], action.payload.oldIndex, action.payload.newIndex)
        }
      };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

// Task component
function Task({ task, status, onDelete, onMove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white p-4 rounded-lg shadow-md border ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-lg">{task.title}</h3>
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-600 p-2 rounded hover:bg-gray-100"
          aria-label="Drag task"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6 4a1 1 0 100 2 1 1 0 000-2zm0 4a1 1 0 100 2 1 1 0 000-2zm0 4a1 1 0 100 2 1 1 0 000-2zm8-8a1 1 0 100 2 1 1 0 000-2zm0 4a1 1 0 100 2 1 1 0 000-2zm0 4a1 1 0 100 2 1 1 0 000-2z" />
          </svg>
        </button>
      </div>
      <p className="text-gray-600 mb-4">{task.description}</p>
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => onDelete(task.id, status)}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Delete
        </button>
        <div className="space-x-2">
          {status !== 'todo' && (
            <button
              type="button"
              onClick={() => onMove(task.id, status, 'todo')}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              To Do
            </button>
          )}
          {status !== 'inprogress' && (
            <button
              type="button"
              onClick={() => onMove(task.id, status, 'inprogress')}
              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            >
              In Progress
            </button>
          )}
          {status !== 'done' && (
            <button
              type="button"
              onClick={() => onMove(task.id, status, 'done')}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Column component
function Column({ id, title, tasks, onDelete, onMove }) {
  return (
    <div className="bg-gray-100 p-4 rounded-lg min-h-96">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <p className="text-gray-500 italic">No tasks in this column</p>
          ) : (
            tasks.map(task => (
              <Task key={task.id} task={task} status={id} onDelete={onDelete} onMove={onMove} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// Main component
function KanbanBoard() {
  const [state, dispatch] = useReducer(kanbanReducer, initialState);

  // Load from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('kanbanState');
    if (savedState) {
      dispatch({ type: 'LOAD_STATE', payload: JSON.parse(savedState) });
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('kanbanState', JSON.stringify(state));
  }, [state]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddTask = (e) => {
    e.preventDefault();
    const title = e.target.title.value.trim();
    const description = e.target.description.value.trim();
    if (title && description) {
      dispatch({ type: 'ADD_TASK', payload: { title, description } });
      e.target.reset();
    }
  };

  const handleDelete = (id, status) => {
    dispatch({ type: 'DELETE_TASK', payload: { id, status } });
  };

  const handleMove = (id, fromStatus, toStatus) => {
    dispatch({ type: 'MOVE_TASK', payload: { id, fromStatus, toStatus } });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the status of active and over
    let activeStatus, overStatus;
    for (const status in state.tasks) {
      if (state.tasks[status].find(t => t.id === activeId)) activeStatus = status;
      if (state.tasks[status].find(t => t.id === overId)) overStatus = status;
    }

    if (activeStatus === overStatus) {
      // Reorder within column
      const oldIndex = state.tasks[activeStatus].findIndex(t => t.id === activeId);
      const newIndex = state.tasks[overStatus].findIndex(t => t.id === overId);
      dispatch({ type: 'REORDER_TASKS', payload: { status: activeStatus, oldIndex, newIndex } });
    } else {
      // Move to different column
      dispatch({ type: 'MOVE_TASK', payload: { id: activeId, fromStatus: activeStatus, toStatus: overStatus } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Kanban Board</h1>
      
      <form onSubmit={handleAddTask} className="mb-8 max-w-md mx-auto">
        <div className="mb-4">
          <input
            type="text"
            name="title"
            placeholder="Task Title"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <textarea
            name="description"
            placeholder="Task Description"
            className="w-full p-2 border rounded"
            rows="3"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Add Task
        </button>
      </form>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Column
            id="todo"
            title="To Do"
            tasks={state.tasks.todo}
            onDelete={handleDelete}
            onMove={handleMove}
          />
          <Column
            id="inprogress"
            title="In Progress"
            tasks={state.tasks.inprogress}
            onDelete={handleDelete}
            onMove={handleMove}
          />
          <Column
            id="done"
            title="Done"
            tasks={state.tasks.done}
            onDelete={handleDelete}
            onMove={handleMove}
          />
        </div>
      </DndContext>
    </div>
  );
}

export default KanbanBoard;