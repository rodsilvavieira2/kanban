import React from "react";
import { useTranslation } from "react-i18next";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "primary";
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  variant = "primary",
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const displayConfirmLabel = confirmLabel || t("common.confirm") || "Confirm";
  const displayCancelLabel = cancelLabel || t("common.cancel") || "Cancel";

  return (
    <div className="modal-overlay">
      <div className="modal-content confirm-dialog">
        <div className="modal-header">
          <div className="modal-title">
            <h2>{title}</h2>
          </div>
          <button className="icon-button" onClick={onCancel}>
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
          <p className="confirm-message">{message}</p>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCancel}>
            {displayCancelLabel}
          </button>
          <button
            className={variant === "danger" ? "btn-danger" : "btn-primary"}
            onClick={onConfirm}
          >
            {displayConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
