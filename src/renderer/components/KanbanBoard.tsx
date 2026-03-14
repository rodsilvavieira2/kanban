import React, { useEffect } from 'react';
import { useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useKanbanStore } from '../stores/kanbanStore';
import { Project } from '../services/projectService';
import { Plus, MoreHorizontal, Search, ArrowLeft } from 'lucide-react';

export function KanbanBoard() {
  const project = useLoaderData() as Project;
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const { 
    columns, 
    tasks, 
    isLoading, 
    loadProjectData, 
    moveTask 
  } = useKanbanStore();

  useEffect(() => {
    if (projectId) {
      loadProjectData(projectId);
    }
  }, [projectId, loadProjectData]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    moveTask({
      taskId: draggableId,
      sourceColumnId: source.droppableId,
      destinationColumnId: destination.droppableId,
      sourceIndex: source.index,
      destinationIndex: destination.index,
    });
  };

  if (!project) return <div className="p-8 text-center">Project not found</div>;
  if (isLoading) return <div className="p-8 text-center text-accents-5">Loading board...</div>;

  return (
    <div className="kanban-view">
      <div className="kanban-header">
        <div className="kanban-header-left">
          <button className="icon-button back-button" onClick={() => navigate('/projects')}>
            <ArrowLeft size={20} />
          </button>
          <h2>{project.name}</h2>
        </div>
        <div className="kanban-header-right">
          <div className="search-bar">
            <Search size={16} />
            <input type="text" placeholder="Search tasks..." />
          </div>
          <button className="btn-primary" onClick={() => navigate(`/projects/${projectId}/tasks/new`)}>
            <Plus size={16} />
            New Task
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-columns-container">
          {columns.map((column) => {
            const columnTasks = tasks
              .filter((task) => task.columnId === column.id)
              .sort((a, b) => a.order - b.order);

            return (
              <div className="kanban-column" key={column.id}>
                <div className="column-header">
                  <div className="column-title">
                    <span 
                      className="column-color-dot" 
                      style={{ backgroundColor: column.color || '#333' }}
                    ></span>
                    <h3>{column.title}</h3>
                    <span className="task-count">{columnTasks.length}</span>
                  </div>
                  <button className="icon-button">
                    <MoreHorizontal size={16} />
                  </button>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      className={`column-tasks ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              className={`kanban-task-card ${snapshot.isDragging ? 'dragging' : ''}`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <h4 className="task-title">{task.title}</h4>
                              {task.description && (
                                <p className="task-description-preview text-accents-5 text-sm mt-1 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                              
                              <div className="task-meta mt-3">
                                <div className="task-meta-right">
                                   {task.dueDate && (
                                     <span className="task-date text-xs text-accents-5">
                                       {new Date(task.dueDate).toLocaleDateString()}
                                     </span>
                                   )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                <button 
                  className="add-task-btn"
                  onClick={() => navigate(`/projects/${projectId}/tasks/new`, { state: { columnId: column.id } })}
                >
                  <Plus size={16} />
                  Add Task
                </button>
              </div>
            );
          })}
          
          <div className="add-column-placeholder">
            <button className="add-column-btn">
              <Plus size={24} />
              <span>Add Column</span>
            </button>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
