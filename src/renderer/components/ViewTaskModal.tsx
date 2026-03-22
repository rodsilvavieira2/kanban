import React from "react";
import { TaskDetailsContent } from "./TaskDetailsContent";
import { X } from "lucide-react";

interface ViewTaskModalProps {
  task: any;
  onClose: () => void;
  onEdit: () => void;
}

export function ViewTaskModal({ task, onClose, onEdit }: ViewTaskModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: "800px", maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px" }}>
            <button className="icon-button" onClick={onClose}><X size={20} /></button>
        </div>
        <TaskDetailsContent task={task} />
      </div>
    </div>
  );
}
