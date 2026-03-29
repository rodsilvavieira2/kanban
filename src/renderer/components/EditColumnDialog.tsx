import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useKanbanStore } from "../stores/kanbanStore";

interface EditColumnDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (columnId: string, title: string) => void;
  columnId: string | null;
}

export function EditColumnDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  columnId,
}: EditColumnDialogProps) {
  const [title, setTitle] = useState("");
  const columns = useKanbanStore((state) => state.columns);

  useEffect(() => {
    if (columnId) {
      const column = columns.find((c) => c.id === columnId);
      if (column) setTitle(column.title);
    }
  }, [columnId, columns]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (columnId && title.trim()) {
      onConfirm(columnId, title.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className="modal-content"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1001,
          }}
        >
          <div className="modal-header">
            <Dialog.Title className="modal-title" asChild>
              <h2>Edit Column</h2>
            </Dialog.Title>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="column-title">Column Title</label>
                <input
                  id="column-title"
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <Dialog.Close asChild>
                <button type="button" className="btn-secondary">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="btn-primary"
                disabled={!title.trim()}
              >
                Save Changes
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
