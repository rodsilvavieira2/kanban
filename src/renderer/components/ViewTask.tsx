import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useKanbanStore } from "../stores/kanbanStore";
import { ArrowLeft, Edit2, Clock, Calendar, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ViewTask() {
  const navigate = useNavigate();
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  const { tasks, loadProjectData } = useKanbanStore();
  const [task, setTask] = useState<any>(null);

  useEffect(() => {
    if (tasks.length === 0 && projectId) {
      loadProjectData(projectId);
    }
  }, [tasks.length, projectId, loadProjectData]);

  useEffect(() => {
    const foundTask = tasks.find((t) => t.id === taskId);
    if (foundTask) {
      setTask(foundTask);
    }
  }, [tasks, taskId]);

  if (!task) return <div>Loading...</div>;

  return (
    <div className="view-task-container" style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <button className="btn-secondary" onClick={() => navigate(`/projects/${projectId}`)}>
          <ArrowLeft size={16} /> Back
        </button>
        <button className="btn-primary" onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}/edit`)}>
          <Edit2 size={16} /> Edit Task
        </button>
      </header>

      <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>{task.title}</h1>

      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", color: "var(--text-secondary)", fontSize: "14px" }}>
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
            <span key={tag} className="tag-chip" style={{ background: "var(--bg-secondary)", padding: "4px 8px", borderRadius: "4px" }}>
              <Tag size={12} style={{ display: "inline-block", marginRight: "4px" }} />
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="markdown-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{task.description || "*No description provided.*"}</ReactMarkdown>
      </div>
    </div>
  );
}
