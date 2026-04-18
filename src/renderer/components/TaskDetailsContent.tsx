import React from "react";
import { Clock, Calendar, Tag, Play } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from "react-i18next";
import { Task } from "../../shared/schemas/models";
import { usePomodoroStore } from "../stores/pomodoroStore";

interface TaskDetailsContentProps {
  task: Task;
  onSelectForPomodoro?: () => void;
}

export function TaskDetailsContent({
  task,
  onSelectForPomodoro,
}: TaskDetailsContentProps) {
  const { t } = useTranslation();
  const { isActive } = usePomodoroStore();

  return (
    <div className="task-details-content" style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "16px",
        }}
      >
        <h1 style={{ fontSize: "24px", margin: 0 }}>{task.title}</h1>
        {onSelectForPomodoro && (
          <button
            className={`btn-primary ${isActive ? "disabled" : ""}`}
            onClick={() => !isActive && onSelectForPomodoro()}
            disabled={isActive}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              opacity: isActive ? 0.6 : 1,
              cursor: isActive ? "not-allowed" : "pointer",
            }}
            title={isActive ? "Cannot change task while session is active" : ""}
          >
            <Play size={16} fill="currentColor" /> {t("tasks.view.select_continue")}
          </button>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "24px",
          color: "var(--text-secondary)",
          fontSize: "14px",
        }}
      >
        {task.dueDate && (
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Calendar size={14} /> {task.dueDate}
          </span>
        )}
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Clock size={14} /> {task.timeSpentMinutes}m {t("pomodoro.spent")}
        </span>
      </div>

      {task.tags && task.tags.length > 0 && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {task.tags.map((tag: string) => (
            <span
              key={tag}
              className="tag-chip"
              style={{
                background: "var(--bg-secondary)",
                padding: "4px 8px",
                borderRadius: "4px",
              }}
            >
              <Tag
                size={12}
                style={{ display: "inline-block", marginRight: "4px" }}
              />
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="markdown-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {task.description || `*${t("tasks.view.no_description")}*`}
        </ReactMarkdown>
      </div>
    </div>
  );
}
