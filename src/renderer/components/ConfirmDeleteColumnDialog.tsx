import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
              <h2>{t("columns.delete_title")}</h2>
            </Dialog.Title>
          </div>

          <div className="modal-body">
            <p className="confirm-message">
              {t("columns.delete_message")}
            </p>
          </div>

          <div className="modal-footer">
            <Dialog.Close asChild>
              <button type="button" className="btn-secondary">
                {t("common.cancel")}
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
              {t("common.delete")}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
