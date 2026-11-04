import { useEffect } from "react";
import { createPortal } from "react-dom";
import "../../styles/dialog.css";
import "../../styles/general-list-dialog.css";

export default function GeneralListDialog({
  title,
  className = "",
  busy = false,
  onClose,
  onSubmit,
  actions,
  children,
}) {
  // Close with the Escape key.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && !busy) onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, busy]);

  // Click outside the dialog closes it (the old dialogs used clickOutsideToClose).
  function handleBackdropMouseDown(event) {
    if (event.target === event.currentTarget && !busy) onClose();
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit();
  }

  // Rendered directly in <body> so the page layout can never affect it.
  return createPortal(
    <div className="dialog-backdrop" onMouseDown={handleBackdropMouseDown}>
      <div
        className={`gl-dialog ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <form className="gl-dialog-form" onSubmit={handleSubmit} noValidate>
          {/* Header */}
          <div className="gl-dialog-header">
            <h2>{title}</h2>

            <button
              type="button"
              className="gl-close"
              aria-label="Close"
              onClick={onClose}
              disabled={busy}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="gl-dialog-content">{children}</div>

          {/* Actions */}
          <div className="gl-dialog-actions">{actions}</div>
        </form>
      </div>
    </div>,
    document.body
  );
}
