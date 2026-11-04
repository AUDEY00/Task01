import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";

export default function ListActionsMenu({ onDelete }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  // Close when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return;

    function handleMouseDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="actions-menu" ref={rootRef}>
      <button
        type="button"
        className="gl-icon-btn"
        id="tour-delete-list"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More list actions"
        title="More list actions"
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true" className="more-dots">
          ⋯
        </span>
      </button>

      {open && (
        <div className="menu" role="menu">
          <button
            type="button"
            role="menuitem"
            className="menu-item danger"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete list
          </button>
        </div>
      )}
    </div>
  );
}
