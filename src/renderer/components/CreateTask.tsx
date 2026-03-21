import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useKanbanStore } from "../stores/kanbanStore";
import { ArrowLeft, X } from "lucide-react";

export function CreateTask() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const stateColumnId = location.state?.columnId;

  const { columns, tasks, createTask } = useKanbanStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columnId, setColumnId] = useState(
    stateColumnId || (columns.length > 0 ? columns[0].id : ""),
  );
  const [dueDate, setDueDate] = useState("");

  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!columnId && columns.length > 0) {
      setColumnId(columns[0].id);
    }
  }, [columns, columnId]);

  useEffect(() => {
    const allTags = new Set<string>();
    tasks.forEach((t) => {
      if (t.tags) t.tags.forEach((tag) => allTags.add(tag));
    });
    setAvailableTags(Array.from(allTags));
  }, [tasks]);

  const handleCancel = () => {
    navigate(`/projects/${projectId}`);
  };

  const handleCreate = async () => {
    if (!title || !columnId || !projectId) return;

    try {
      await createTask(projectId, {
        title,
        description,
        columnId,
        dueDate: dueDate || undefined,
        tags: selectedTags,
      });
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const addTag = (tag: string) => {
    const normalizedTag = tag.trim();
    if (normalizedTag && !selectedTags.includes(normalizedTag)) {
      setSelectedTags([...selectedTags, normalizedTag]);
      if (!availableTags.includes(normalizedTag)) {
        setAvailableTags([...availableTags, normalizedTag]);
      }
    }
    setTagInput("");
    setIsDropdownOpen(false);
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput) {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  const filteredTags = availableTags.filter(
    (tag) =>
      tag.toLowerCase().includes(tagInput.toLowerCase()) &&
      !selectedTags.includes(tag),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="create-task-view">
      <div className="kanban-header">
        <div className="kanban-header-left">
          <button className="icon-button back-button" onClick={handleCancel}>
            <ArrowLeft size={20} />
          </button>
        </div>
      </div>

      <div className="create-task-content">
        <div className="create-task-page-header">
          <div className="title-section">
            <h1>Create New Task</h1>
            <p>Add a new task to your workspace</p>
          </div>
          <div className="header-actions">
            <button className="btn-danger" onClick={handleCancel}>
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleCreate}
              disabled={!title || !columnId}
            >
              Create Task
            </button>
          </div>
        </div>

        <div className="create-task-form-layout">
          <div className="form-main-column">
            <div className="form-section-card">
              <div className="form-section-header">
                <h3>General Info</h3>
              </div>
              <div className="form-section-body">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-input large-input"
                    placeholder="Task Name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Provide details about this task..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Column</label>
                  <select
                    className="form-input"
                    value={columnId}
                    onChange={(e) => setColumnId(e.target.value)}
                  >
                    {columns.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div className="form-group" ref={dropdownRef}>
                  <label>Tags</label>
                  <div className="tag-system-container">
                    <div className="tag-input-wrapper">
                      {selectedTags.map((tag) => (
                        <span key={tag} className="tag-chip">
                          {tag}
                          <button
                            type="button"
                            className="remove-tag"
                            onClick={() => removeTag(tag)}
                          >
                            <X size={12} strokeWidth={3} />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        className="tag-bare-input"
                        placeholder={
                          selectedTags.length === 0
                            ? "Select or create tags..."
                            : ""
                        }
                        value={tagInput}
                        onChange={(e) => {
                          setTagInput(e.target.value);
                          setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                    {isDropdownOpen &&
                      (tagInput || filteredTags.length > 0) && (
                        <div className="tags-dropdown">
                          {filteredTags.map((tag) => (
                            <div
                              key={tag}
                              className="tag-option"
                              onClick={() => addTag(tag)}
                            >
                              {tag}
                            </div>
                          ))}
                          {tagInput &&
                            !availableTags.some(
                              (t) => t.toLowerCase() === tagInput.toLowerCase(),
                            ) && (
                              <div
                                className="tag-option create-option"
                                onClick={() => addTag(tagInput)}
                              >
                                Create "<span>{tagInput}</span>"
                              </div>
                            )}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
