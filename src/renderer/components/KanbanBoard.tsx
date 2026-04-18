import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useKanbanStore } from "../stores/kanbanStore";
import { useProjectStore } from "../stores/projectStore";
import { useSettingsStore } from "../stores/settingsStore";
import {
  Plus,
  MoreHorizontal,
  Search,
  ArrowLeft,
  MoreVertical,
  Eye,
  Edit2,
  Trash,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  List,
} from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ConfirmDeleteTaskDialog } from "./ConfirmDeleteTaskDialog";
import { CreateColumnDialog } from "./CreateColumnDialog";
import { EditColumnDialog } from "./EditColumnDialog";
import { ConfirmDeleteColumnDialog } from "./ConfirmDeleteColumnDialog";
import { KanbanTableView } from "./KanbanTableView";

export function KanbanBoard() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { projects, loadProjects } = useProjectStore();
  const { settings } = useSettingsStore();
  const {
    isLoading,
    loadProjectData,
    moveTask,
    moveColumn,
    initUpdateListener,
    columns,
    tasks,
    createColumn,
    editColumn,
    deleteColumn,
    collapsedColumns,
    toggleColumnCollapse,
  } = useKanbanStore();

  const [viewMode, setViewMode] = useState<"kanban" | "table">(
    (settings.boardViewMode as "kanban" | "table") || "kanban",
  );

  useEffect(() => {
    if (settings.boardViewMode) {
      setViewMode(settings.boardViewMode as "kanban" | "table");
    }
  }, [settings.boardViewMode]);

  const [openMenuTaskId, setOpenMenuTaskId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const [createColumnDialogOpen, setCreateColumnDialogOpen] = useState(false);
  const [editColumnDialogOpen, setEditColumnDialogOpen] = useState(false);
  const [columnToEdit, setColumnToEdit] = useState<string | null>(null);
  const [deleteColumnDialogOpen, setDeleteColumnDialogOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (projectId) {
      loadProjects();
      loadProjectData(projectId);
      initUpdateListener(projectId);
    }
  }, [projectId, loadProjects, loadProjectData, initUpdateListener]);

  const project = projects.find((p) => p.id === projectId);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "column") {
      if (projectId) {
        moveColumn(projectId, source.index, destination.index);
      }
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

  const handleMenuClick = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPosition({ x: rect.right, y: rect.top + rect.height });
    setOpenMenuTaskId(taskId === openMenuTaskId ? null : taskId);
  };

  const handleDeleteTaskClick = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    setTaskToDelete(taskId);
    setDeleteDialogOpen(true);
    setOpenMenuTaskId(null);
  };

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      useKanbanStore.getState().deleteTask(taskToDelete);
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleCreateColumn = async (title: string) => {
    if (projectId) {
      await createColumn(projectId, title);
    }
  };

  const handleEditColumn = async (columnId: string, title: string) => {
    await editColumn(columnId, title);
  };

  const handleDeleteColumn = async (columnId: string) => {
    await deleteColumn(columnId);
  };

  useEffect(() => {
    const handleClick = () => setOpenMenuTaskId(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  if (isLoading && columns.length === 0)
    return (
      <div className="p-8 text-center text-accents-5">Loading board...</div>
    );

  return (
    <div className="kanban-view">
      {openMenuTaskId && (
        <div
          className="task-menu-dropdown"
          style={{ left: menuPosition.x, top: menuPosition.y }}
        >
          <div
            className="task-menu-item"
            onClick={() =>
              navigate(`/projects/${projectId}/tasks/${openMenuTaskId}/view`)
            }
          >
            <Eye size={16} /> View Details
          </div>
          <div
            className="task-menu-item"
            onClick={() =>
              navigate(`/projects/${projectId}/tasks/${openMenuTaskId}/edit`)
            }
          >
            <Edit2 size={16} /> Edit
          </div>
          <div
            className="task-menu-item text-danger"
            style={{ color: "var(--error)" }}
            onClick={(e) => {
              if (openMenuTaskId) handleDeleteTaskClick(e, openMenuTaskId);
            }}
          >
            <Trash size={16} /> Delete
          </div>
        </div>
      )}
      <ConfirmDeleteTaskDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteTask}
      />
      <CreateColumnDialog
        isOpen={createColumnDialogOpen}
        onOpenChange={setCreateColumnDialogOpen}
        onConfirm={handleCreateColumn}
      />
      <EditColumnDialog
        isOpen={editColumnDialogOpen}
        onOpenChange={setEditColumnDialogOpen}
        onConfirm={handleEditColumn}
        columnId={columnToEdit}
      />
      <ConfirmDeleteColumnDialog
        isOpen={deleteColumnDialogOpen}
        onOpenChange={setDeleteColumnDialogOpen}
        onConfirm={() => columnToDelete && handleDeleteColumn(columnToDelete)}
      />
      <div className="kanban-header">
        <div className="kanban-header-left">
          <button
            className="icon-button back-button"
            onClick={() => navigate("/projects")}
          >
            <ArrowLeft size={20} />
          </button>
          <h2>{project?.name || t("common.project_board")}</h2>
        </div>
        <div className="kanban-header-right">
          <div className="view-mode-toggle">
            <button
              className={`toggle-btn ${viewMode === "kanban" ? "active" : ""}`}
              onClick={() => setViewMode("kanban")}
              title="Kanban View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={`toggle-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>
          <div className="search-bar">
            <Search size={16} />
            <input
              type="text"
              placeholder={t("common.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="btn-primary"
            onClick={() => navigate(`/projects/${projectId}/tasks/new`)}
          >
            <Plus size={16} />
            {t("common.new_task")}
          </button>
        </div>
      </div>

      {viewMode === "kanban" ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" type="column" direction="horizontal">
            {(provided) => (
              <div
                className="kanban-columns-container"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {[...columns]
                  .sort((a, b) => a.order - b.order)
                  .map((column, index) => {
                    const columnTasks = tasks
                      .filter(
                        (task) =>
                          task.columnId === column.id &&
                          (task.title
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                            task.description
                              ?.toLowerCase()
                              .includes(searchQuery.toLowerCase())),
                      )
                      .sort((a, b) => a.order - b.order);

                    const isCollapsed = collapsedColumns[column.id] || false;

                    return (
                      <Draggable
                        key={column.id}
                        draggableId={column.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Collapsible.Root
                            className={`kanban-column ${snapshot.isDragging ? "dragging" : ""} ${isCollapsed ? "collapsed" : ""}`}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            open={!isCollapsed}
                            onOpenChange={() => toggleColumnCollapse(column.id)}
                          >
                            <div
                              className="column-header"
                              {...provided.dragHandleProps}
                            >
                              <div className="column-title">
                                <Collapsible.Trigger asChild>
                                  <button className="icon-button collapse-toggle">
                                    {isCollapsed ? (
                                      <ChevronRight size={16} />
                                    ) : (
                                      <ChevronDown size={16} />
                                    )}
                                  </button>
                                </Collapsible.Trigger>
                                <span
                                  className="column-color-dot"
                                  style={{
                                    backgroundColor: column.color || "#333",
                                  }}
                                ></span>
                                <h3>{column.title}</h3>
                                <span className="task-count">
                                  {columnTasks.length}
                                </span>
                              </div>
                              <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                  <button className="icon-button">
                                    <MoreHorizontal size={16} />
                                  </button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Portal>
                                  <DropdownMenu.Content
                                    className="dropdown-menu-content"
                                    sideOffset={5}
                                  >
                                    <DropdownMenu.Item
                                      className="dropdown-item"
                                      onClick={() => {
                                        setColumnToEdit(column.id);
                                        setEditColumnDialogOpen(true);
                                      }}
                                    >
                                      <Edit2 size={16} /> {t("common.edit_name")}
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                      className="dropdown-item delete"
                                      onClick={() => {
                                        setColumnToDelete(column.id);
                                        setDeleteColumnDialogOpen(true);
                                      }}
                                    >
                                      <Trash size={16} /> {t("common.delete_column")}
                                    </DropdownMenu.Item>
                                  </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                              </DropdownMenu.Root>
                            </div>

                            <Collapsible.Content className="column-content">
                              <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                  <div
                                    className={`column-tasks ${snapshot.isDraggingOver ? "dragging-over" : ""}`}
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                  >
                                    {columnTasks.map((task, index) => (
                                      <Draggable
                                        key={task.id}
                                        draggableId={task.id}
                                        index={index}
                                      >
                                        {(provided, snapshot) => (
                                          <div
                                            className={`kanban-task-card ${snapshot.isDragging ? "dragging" : ""}`}
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            onClick={() =>
                                              navigate(
                                                `/projects/${projectId}/tasks/${task.id}/view`,
                                              )
                                            }
                                          >
                                            <div
                                              style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "flex-start",
                                              }}
                                            >
                                              <h4
                                                className="task-title"
                                                style={{ margin: 0 }}
                                              >
                                                {task.title}
                                              </h4>
                                              <button
                                                className="icon-button"
                                                onClick={(e) =>
                                                  handleMenuClick(e, task.id)
                                                }
                                                style={{ padding: 0 }}
                                              >
                                                <MoreVertical size={16} />
                                              </button>
                                            </div>
                                            {task.description && (
                                              <div className="task-description-preview text-accents-5 text-sm mt-1 markdown-preview">
                                                <ReactMarkdown
                                                  remarkPlugins={[remarkGfm]}
                                                >
                                                  {task.description}
                                                </ReactMarkdown>
                                              </div>
                                            )}

                                            {task.tags &&
                                              task.tags.length > 0 && (
                                                <div
                                                  className="task-tags-preview mt-2"
                                                  style={{
                                                    display: "flex",
                                                    gap: "4px",
                                                    flexWrap: "wrap",
                                                  }}
                                                >
                                                  {task.tags.map((tag) => (
                                                    <span
                                                      key={tag}
                                                      className="tag-chip text-xs"
                                                      style={{
                                                        backgroundColor: "#333",
                                                        padding: "2px 6px",
                                                        borderRadius: "4px",
                                                        color: "#fff",
                                                        fontSize: "10px",
                                                      }}
                                                    >
                                                      {tag}
                                                    </span>
                                                  ))}
                                                </div>
                                              )}

                                            <div className="task-meta mt-3">
                                              <div className="task-meta-right">
                                                {task.dueDate && (
                                                  <span className="task-date text-xs text-accents-5">
                                                    {new Date(
                                                      task.dueDate,
                                                    ).toLocaleDateString()}
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
                                onClick={() =>
                                  navigate(`/projects/${projectId}/tasks/new`, {
                                    state: { columnId: column.id },
                                  })
                                }
                              >
                                <Plus size={16} />
                                {t("common.add_task")}
                              </button>
                            </Collapsible.Content>
                          </Collapsible.Root>
                        )}
                      </Draggable>
                    );
                  })}
                {provided.placeholder}

                <div className="add-column-placeholder">
                  <button
                    className="add-column-btn"
                    onClick={() => setCreateColumnDialogOpen(true)}
                  >
                    <Plus size={24} />
                    <span>{t("common.add_column")}</span>
                  </button>
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <KanbanTableView
          initialSearchQuery={searchQuery}
          onDeleteTask={(taskId) => {
            setTaskToDelete(taskId);
            setDeleteDialogOpen(true);
          }}
        />
      )}
    </div>
  );
}
