import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";

interface CreateColumnDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (title: string) => void;
}

export function CreateColumnDialog({
  isOpen,
  onOpenChange,
  onConfirm,
}: CreateColumnDialogProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onConfirm(title.trim());
      setTitle("");
      onOpenChange(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) setTitle("");
    onOpenChange(open);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className="modal-content"
          aria-describedby={undefined}
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
              <h2>{t("columns.add_title")}</h2>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="icon-button" aria-label="Close">
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
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="column-title">{t("columns.label")}</label>
                <input
                  id="column-title"
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("columns.placeholder")}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <Dialog.Close asChild>
                <button type="button" className="btn-secondary">
                  {t("common.cancel")}
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="btn-primary"
                disabled={!title.trim()}
              >
                {t("columns.add_title")}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
