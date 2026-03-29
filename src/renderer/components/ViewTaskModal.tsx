import React from "react";
import { TaskDetailsContent } from "./TaskDetailsContent";
import { X } from "lucide-react";
import { Task } from "../../shared/schemas/models";
import { usePomodoroStore } from "../stores/pomodoroStore";

interface ViewTaskModalProps {
  task: Task | undefined;
  onClose: () => void;
  onEdit?: () => void; // Added back if needed
}

export function ViewTaskModal({ task, onClose }: ViewTaskModalProps) {
  const { setSelectedTaskId } = usePomodoroStore();

  if (!task) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "85%",
          maxWidth: "90vw",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "16px",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <button className="icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <TaskDetailsContent
          task={task}
          onSelectForPomodoro={() => {
            setSelectedTaskId(task.id);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
