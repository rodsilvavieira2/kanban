import React, { useState, useRef, useEffect, useActionState } from "react";
import * as Select from "@radix-ui/react-select";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useKanbanStore } from "../stores/kanbanStore";
import { ArrowLeft, X, ChevronDown, ChevronUp, Check } from "lucide-react";

interface RadixSelectProps {
  value: string;
  onValueChange?: (value: string) => void;
  options: { value: string; label: string }[];
  ariaLabel?: string;
  placeholder?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
}

function RadixSelect({
  value,
  onValueChange,
  options,
  ariaLabel,
  placeholder,
  name,
  required,
  disabled,
}: RadixSelectProps) {
  return (
    <Select.Root
      value={value}
      onValueChange={onValueChange}
      name={name}
      required={required}
      disabled={disabled}
    >
      <Select.Trigger className="radix-select-trigger" aria-label={ariaLabel}>
        <Select.Value placeholder={placeholder} />
        <Select.Icon asChild>
          <ChevronDown className="radix-select-chevron" size={14} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="radix-select-content"
          position="popper"
          sideOffset={5}
        >
          <Select.ScrollUpButton className="radix-select-scroll-btn">
            <ChevronUp size={14} />
          </Select.ScrollUpButton>
          <Select.Viewport className="radix-select-viewport">
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="radix-select-item"
              >
                <Select.ItemIndicator className="radix-select-indicator">
                  <Check size={14} />
                </Select.ItemIndicator>
                <Select.ItemText>{opt.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="radix-select-scroll-btn">
            <ChevronDown size={14} />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export function EditTask() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { projectId, taskId } = useParams<{
    projectId: string;
    taskId: string;
  }>();

  const { columns, tasks, updateTask, loadProjectData } = useKanbanStore();

  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Preload task data
  useEffect(() => {
    if (tasks.length === 0 && projectId) {
      loadProjectData(projectId);
    }
  }, [tasks.length, projectId, loadProjectData]);

  const task = tasks.find((t) => t.id === taskId);

  // Update selectedTags when task loads
  useEffect(() => {
    if (task && task.tags) {
      setSelectedTags(task.tags);
    }
  }, [task]);

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

  const updateAction = async (prevState: unknown, formData: FormData) => {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const columnId = formData.get("columnId") as string;
    const dueDate = formData.get("dueDate") as string;
    const tags = formData.getAll("tags") as string[];

    if (!title || !columnId || !taskId)
      return { error: "Missing required fields" };

    try {
      await updateTask(taskId, {
        title,
        description,
        columnId,
        dueDate: dueDate || undefined,
        tags,
      });
      navigate(`/projects/${projectId}`);
      return { success: true };
    } catch (error) {
      console.error("Failed to update task:", error);
      return { error: "Failed to update task" };
    }
  };

  const [state, formAction, isPending] = useActionState(updateAction, null);

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
      e.preventDefault();
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

  if (!task && tasks.length > 0) {
    return (
      <div className="create-task-view">
        <div className="kanban-header">
          <div className="kanban-header-left">
            <button
              className="icon-button back-button"
              onClick={handleCancel}
              type="button"
            >
              <ArrowLeft size={20} />
            </button>
          </div>
        </div>
        <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
          {t("tasks.not_found")}
        </div>
      </div>
    );
  }

  return (
    <div className="create-task-view">
      <div className="kanban-header">
        <div className="kanban-header-left">
          <button
            className="icon-button back-button"
            onClick={handleCancel}
            type="button"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
      </div>

      <div className="create-task-content">
        {task ? (
          <form action={formAction}>
            <div className="create-task-page-header">
              <div className="title-section">
                <h1>{t("tasks.edit_title")}</h1>
                <p>{t("tasks.edit_desc")}</p>
              </div>
              <div className="header-actions">
                <button
                  className="btn-danger"
                  onClick={handleCancel}
                  type="button"
                  disabled={isPending}
                >
                  {t("common.cancel")}
                </button>
                <button
                  className="btn-primary"
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? t("tasks.saving") : t("tasks.save_changes")}
                </button>
              </div>
            </div>

            <div className="create-task-form-layout">
              <div className="form-main-column">
                <div className="form-section-card">
                  <div className="form-section-header">
                    <h3>{t("tasks.general_info")}</h3>
                    {state?.error && (
                      <span
                        className="error-text"
                        style={{
                          color: "red",
                          fontSize: "0.85em",
                          marginLeft: "10px",
                        }}
                      >
                        {state.error}
                      </span>
                    )}
                  </div>
                  <div className="form-section-body">
                    <div className="form-group">
                      <input
                        name="title"
                        type="text"
                        className="form-input large-input"
                        placeholder={t("tasks.name_placeholder")}
                        defaultValue={task.title}
                        required
                        disabled={isPending}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t("tasks.desc_label")} <span className="form-label-hint">{t("tasks.markdown_supported")}</span></label>
                      <textarea
                        name="description"
                        className="form-textarea"
                        placeholder={t("tasks.desc_placeholder")}
                        defaultValue={task.description || ""}
                        disabled={isPending}
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <label>{t("tasks.column_label")}</label>
                      <RadixSelect
                        name="columnId"
                        value={task.columnId}
                        options={columns.map((col) => ({
                          value: col.id,
                          label: col.title,
                        }))}
                        required
                        disabled={isPending}
                        ariaLabel="Column"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t("tasks.due_date_label")}</label>
                      <input
                        name="dueDate"
                        type="date"
                        className="form-input"
                        defaultValue={task.dueDate || ""}
                        disabled={isPending}
                      />
                    </div>
                    <div className="form-group" ref={dropdownRef}>
                      <label>{t("tasks.tags_label")}</label>
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
                                ? t("tasks.tags_placeholder")
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
                                  (t) =>
                                    t.toLowerCase() === tagInput.toLowerCase(),
                                ) && (
                                  <div
                                    className="tag-option create-option"
                                    onClick={() => addTag(tagInput)}
                                  >
                                    {t("tasks.create_tag", { tag: tagInput })}
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
        ) : (
          <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
            {t("tasks.loading")}
          </div>
        )}
      </div>
    </div>
  );
}
