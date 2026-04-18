import React from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useTranslation } from "react-i18next";

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
  title,
  description,
}: ConfirmDeleteTaskDialogProps) {
  const { t } = useTranslation();
  const displayTitle = title || t("tasks.delete_title") || "Delete Task";
  const displayDescription = description || t("tasks.delete_description") || "Are you sure you want to delete this task? This action cannot be undone.";
  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="radix-alert-dialog-overlay" />
        <AlertDialog.Content className="radix-alert-dialog-content">
          <AlertDialog.Title className="radix-alert-dialog-title">
            {displayTitle}
          </AlertDialog.Title>
          <AlertDialog.Description className="radix-alert-dialog-description">
            {displayDescription}
          </AlertDialog.Description>
          <div className="radix-alert-dialog-actions">
            <AlertDialog.Cancel asChild>
              <button className="btn-secondary">{t("common.cancel")}</button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                className="btn-danger"
                onClick={(e) => {
                  e.preventDefault();
                  onConfirm();
                }}
              >
                {t("common.delete")}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
