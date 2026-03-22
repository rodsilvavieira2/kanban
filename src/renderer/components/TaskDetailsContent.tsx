import React from "react";
import { Clock, Calendar, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Task } from "../../shared/schemas/models";

interface TaskDetailsContentProps {
  task: Task;
  // Removed onEdit and onBack as requested for modal view
}

export function TaskDetailsContent({ task }: TaskDetailsContentProps) {
  return (
    <div className="task-details-content" style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>{task.title}</h1>

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
          <Clock size={14} /> {task.timeSpentMinutes}m spent
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
          {task.description || "*No description provided.*"}
        </ReactMarkdown>
      </div>
    </div>
  );
}
