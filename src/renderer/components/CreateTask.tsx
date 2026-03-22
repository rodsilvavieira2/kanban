import React, { useState, useRef, useEffect, useActionState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useKanbanStore } from "../stores/kanbanStore";
import { ArrowLeft, X } from "lucide-react";

export function CreateTask() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const stateColumnId = location.state?.columnId;

  const { columns, tasks, createTask } = useKanbanStore();

  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const createAction = async (prevState: any, formData: FormData) => {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const columnId = formData.get("columnId") as string;
    const dueDate = formData.get("dueDate") as string;
    const tags = formData.getAll("tags") as string[];

    if (!title || !columnId || !projectId) return { error: "Missing required fields" };

    try {
      await createTask(projectId, {
        title,
        description,
        columnId,
        dueDate: dueDate || undefined,
        tags,
      });
      navigate(`/projects/${projectId}`);
      return { success: true };
    } catch (error) {
      console.error("Failed to create task:", error);
      return { error: "Failed to create task" };
    }
  };

  const [state, formAction, isPending] = useActionState(createAction, null);

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
    if (e.key === "Enter") {
      e.preventDefault(); // prevent form submission
      if (tagInput) {
        addTag(tagInput);
      }
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
          <button className="icon-button back-button" onClick={handleCancel} type="button">
            <ArrowLeft size={20} />
          </button>
        </div>
      </div>

      <div className="create-task-content">
        <form action={formAction}>
          <div className="create-task-page-header">
            <div className="title-section">
              <h1>Create New Task</h1>
              <p>Add a new task to your workspace</p>
            </div>
            <div className="header-actions">
              <button className="btn-danger" onClick={handleCancel} type="button" disabled={isPending}>
                Cancel
              </button>
              <button
                className="btn-primary"
                type="submit"
                disabled={isPending}
              >
                {isPending ? "Creating..." : "Create Task"}
              </button>
            </div>
          </div>

          <div className="create-task-form-layout">
            <div className="form-main-column">
              <div className="form-section-card">
                <div className="form-section-header">
                  <h3>General Info</h3>
                  {state?.error && <span className="error-text" style={{ color: "red", fontSize: "0.85em", marginLeft: "10px" }}>{state.error}</span>}
                </div>
                <div className="form-section-body">
                  <div className="form-group">
                    <input
                      name="title"
                      type="text"
                      className="form-input large-input"
                      placeholder="Task Name"
                      required
                      disabled={isPending}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      className="form-textarea"
                      placeholder="Provide details about this task..."
                      disabled={isPending}
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label>Column</label>
                    <select
                      name="columnId"
                      className="form-input"
                      defaultValue={stateColumnId || (columns.length > 0 ? columns[0].id : "")}
                      key={columns.length ? "loaded" : "loading"}
                      required
                      disabled={isPending}
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
                      name="dueDate"
                      type="date"
                      className="form-input"
                      disabled={isPending}
                    />
                  </div>
                  <div className="form-group" ref={dropdownRef}>
                    <label>Tags</label>
                    <div className="tag-system-container">
                      <div className="tag-input-wrapper">
                        {selectedTags.map((tag) => (
                          <span key={tag} className="tag-chip">
                            {tag}
                            <input type="hidden" name="tags" value={tag} />
                            <button
                              type="button"
                              className="remove-tag"
                              onClick={() => removeTag(tag)}
                              disabled={isPending}
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
                          disabled={isPending}
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
        </form>
      </div>
    </div>
  );
}
