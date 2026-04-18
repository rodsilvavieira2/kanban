import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useKanbanStore } from "../stores/kanbanStore";
import {
  Calendar,
  Clock,
  MoreVertical,
  Search,
  X,
  Edit2,
  Eye,
  Trash,
  Check,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface KanbanTableViewProps {
  onDeleteTask?: (taskId: string) => void;
  initialSearchQuery?: string;
}

export function KanbanTableView({
  onDeleteTask,
  initialSearchQuery = "",
}: KanbanTableViewProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { tasks, columns, moveTask } = useKanbanStore();

  // Filter states
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const projectColumns = useMemo(() => {
    return columns
      .filter((col) => col.projectId === projectId)
      .sort((a, b) => a.order - b.order);
  }, [columns, projectId]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    tasks
      .filter((task) => task.projectId === projectId)
      .forEach((task) => {
        task.tags?.forEach((tag) => tags.add(tag));
      });
    return Array.from(tags).sort();
  }, [tasks, projectId]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesProject = task.projectId === projectId;
        const matchesSearch = task.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || task.columnId === statusFilter;
        const matchesTag =
          tagFilter === "all" || (task.tags && task.tags.includes(tagFilter));

        let matchesDate = true;
        if (dateFilter !== "all") {
          if (!task.dueDate) {
            matchesDate = false;
          } else {
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);

            if (dateFilter === "overdue") {
              matchesDate = dueDate < today;
            } else if (dateFilter === "today") {
              matchesDate = dueDate >= today && dueDate < tomorrow;
            } else if (dateFilter === "soon") {
              matchesDate = dueDate >= today && dueDate < nextWeek;
            }
          }
        }

        return (
          matchesProject &&
          matchesSearch &&
          matchesStatus &&
          matchesTag &&
          matchesDate
        );
      })
      .sort((a, b) => a.order - b.order);
  }, [tasks, projectId, searchQuery, statusFilter, tagFilter, dateFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTagFilter("all");
    setDateFilter("all");
  };

  const getColumnTitle = (columnId: string) => {
    return columns.find((c) => c.id === columnId)?.title || "Unknown";
  };

  const handleStatusChange = (taskId: string, newColumnId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.columnId === newColumnId) return;

    // We don't have indexes in the table view in a way that maps directly to moveTask's source/dest index
    // But we can append it to the end of the new column
    const destinationColumnTasks = tasks.filter(
      (t) => t.columnId === newColumnId,
    );
    const sourceColumnTasks = tasks.filter((t) => t.columnId === task.columnId);

    const sourceIndex = sourceColumnTasks
      .sort((a, b) => a.order - b.order)
      .findIndex((t) => t.id === taskId);

    moveTask({
      taskId,
      sourceColumnId: task.columnId,
      destinationColumnId: newColumnId,
      sourceIndex,
      destinationIndex: destinationColumnTasks.length,
    });
  };

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="kanban-table-view">
      <div className="table-filters-bar">
        <div className="filter-group search">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder={t("common.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-input"
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => setSearchQuery("")}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="filter-group">
          <label htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            {projectColumns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.title}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="tag-filter">Tag</label>
          <select
            id="tag-filter"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="date-filter">Due Date</label>
          <select
            id="date-filter"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Any Date</option>
            <option value="overdue">Overdue</option>
            <option value="today">Due Today</option>
            <option value="soon">Due Soon (7 days)</option>
          </select>
        </div>

        {(searchQuery ||
          statusFilter !== "all" ||
          tagFilter !== "all" ||
          dateFilter !== "all") && (
          <button className="btn-clear-filters" onClick={clearFilters}>
            <X size={14} />
            Clear Filters
          </button>
        )}
      </div>

      <div className="projects-table">
        <div className="projects-table-head">
          <div className="table-cell col-task-name">Task Name</div>
          <div className="table-cell col-task-status">Status</div>
          <div className="table-cell col-task-tags">Tags</div>
          <div className="table-cell col-task-due">Due Date</div>
          <div className="table-cell col-task-time">Time Spent</div>
          <div className="table-cell col-task-actions"></div>
        </div>
        <div className="projects-table-body">
          {filteredTasks.length === 0 ? (
            <div className="no-results">
              <p>No tasks found matching your filters.</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task.id} className="projects-table-row">
                <div
                  className="table-cell col-task-name"
                  onClick={() =>
                    navigate(`/projects/${projectId}/tasks/${task.id}/view`)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <span className="task-title">{task.title}</span>
                </div>
                <div className="table-cell col-task-status">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button
                        className="status-badge interactive"
                        style={{
                          cursor: "pointer",
                          backgroundColor: "var(--bg-secondary)",
                          color: "var(--text-secondary)",
                          borderColor: "var(--border-color)",
                        }}
                      >
                        {getColumnTitle(task.columnId)}
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        className="dropdown-menu-content"
                        sideOffset={5}
                      >
                        <DropdownMenu.Label className="dropdown-label">
                          Move to Column
                        </DropdownMenu.Label>
                        {projectColumns.map((col) => (
                          <DropdownMenu.Item
                            key={col.id}
                            className={`dropdown-item ${task.columnId === col.id ? "active" : ""}`}
                            onClick={() => handleStatusChange(task.id, col.id)}
                          >
                            <span
                              className="column-color-dot"
                              style={{
                                backgroundColor: col.color || "#333",
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                              }}
                            ></span>
                            {col.title}
                            {task.columnId === col.id && (
                              <Check
                                size={14}
                                style={{ marginLeft: "auto" }}
                              />
                            )}
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
                <div className="table-cell col-task-tags">
                  <div
                    className="task-tags-preview"
                    style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}
                  >
                    {task.tags && task.tags.length > 0 ? (
                      task.tags.map((tag) => (
                        <span
                          key={tag}
                          className="tag-chip text-xs"
                          style={{
                            backgroundColor: "var(--accents-2)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            color: "var(--text-primary)",
                            fontSize: "10px",
                          }}
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-accents-4">—</span>
                    )}
                  </div>
                </div>
                <div className="table-cell col-task-due">
                  {task.dueDate ? (
                    <div
                      className="meta-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Calendar size={14} className="text-accents-4" />
                      <span className="due-date-text">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-accents-4">—</span>
                  )}
                </div>
                <div className="table-cell col-task-time">
                  <div
                    className="meta-item tabular-nums"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Clock size={14} className="text-accents-4" />
                    <span className="due-date-text">
                      {formatTime(task.timeSpentMinutes || 0)}
                    </span>
                  </div>
                </div>
                <div className="table-cell col-task-actions">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="icon-button">
                        <MoreVertical size={16} />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        className="dropdown-menu-content"
                        sideOffset={5}
                        align="end"
                      >
                        <DropdownMenu.Item
                          className="dropdown-item"
                          onClick={() =>
                            navigate(
                              `/projects/${projectId}/tasks/${task.id}/view`,
                            )
                          }
                        >
                          <Eye size={16} /> {t("common.view_details")}
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="dropdown-item"
                          onClick={() =>
                            navigate(
                              `/projects/${projectId}/tasks/${task.id}/edit`,
                            )
                          }
                        >
                          <Edit2 size={16} /> {t("common.edit")}
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="dropdown-item delete"
                          onClick={() => onDeleteTask?.(task.id)}
                        >
                          <Trash size={16} /> {t("common.delete")}
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
