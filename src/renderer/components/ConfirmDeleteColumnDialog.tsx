import React from "react";
import * as Dialog from "@radix-ui/react-dialog";

interface ConfirmDeleteColumnDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ConfirmDeleteColumnDialog({
  isOpen,
  onOpenChange,
  onConfirm,
}: ConfirmDeleteColumnDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className="modal-content confirm-dialog"
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
              <h2>Delete Column</h2>
            </Dialog.Title>
          </div>

          <div className="modal-body">
            <p className="confirm-message">
              Are you sure you want to delete this column? All tasks within this column will also be deleted. This action cannot be undone.
            </p>
          </div>

          <div className="modal-footer">
            <Dialog.Close asChild>
              <button type="button" className="btn-secondary">
                Cancel
              </button>
            </Dialog.Close>
            <button
              type="button"
              className="btn-primary btn-error"
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              Delete Column
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
