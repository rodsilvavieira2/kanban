import React, { useActionState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectStore } from "../stores/projectStore";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
}: CreateProjectModalProps) {
  const createProject = useProjectStore((state) => state.createProject);
  const navigate = useNavigate();

  const [, formAction, isPending] = useActionState(
    async (previousState: unknown, formData: FormData) => {
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;

      if (!name?.trim()) return null;

      try {
        await createProject({
          name: name.trim(),
          description: description?.trim() || "",
        });
        onClose();
        navigate("/projects");
        return { success: true };
      } catch (err) {
        console.error("Failed to create project:", err);
        return { error: "Failed to create project" };
      }
    },
    null,
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form
        action={formAction}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-title-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <h2>Create New Project</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Mobile App Development"
              className="form-input"
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="What's this project about? Define goals and scope..."
              className="form-textarea"
            ></textarea>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending ? "Creating…" : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
