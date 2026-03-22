import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useKanbanStore } from "../stores/kanbanStore";
import { TaskDetailsContent } from "./TaskDetailsContent";
import { ArrowLeft, Edit2 } from "lucide-react";

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
    <div className="view-task-container" style={{ padding: "24px", maxWidth: "800px", margin: "0 auto", height: "100%", overflowY: "auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <button className="btn-secondary" onClick={() => navigate(`/projects/${projectId}`)}>
          <ArrowLeft size={16} /> Back
        </button>
        <button className="btn-primary" onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}/edit`)}>
          <Edit2 size={16} /> Edit Task
        </button>
      </header>

      <TaskDetailsContent task={task} />
    </div>
  );
}
