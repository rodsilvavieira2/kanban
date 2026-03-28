import React from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

interface ConfirmDeleteTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export function ConfirmDeleteTaskDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title = "Delete Task",
  description = "Are you sure you want to delete this task? This action cannot be undone.",
}: ConfirmDeleteTaskDialogProps) {
  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="radix-alert-dialog-overlay" />
        <AlertDialog.Content className="radix-alert-dialog-content">
          <AlertDialog.Title className="radix-alert-dialog-title">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="radix-alert-dialog-description">
            {description}
          </AlertDialog.Description>
          <div className="radix-alert-dialog-actions">
            <AlertDialog.Cancel asChild>
              <button className="btn-secondary">Cancel</button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                className="btn-danger"
                onClick={(e) => {
                  e.preventDefault();
                  onConfirm();
                }}
              >
                Delete Task
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
