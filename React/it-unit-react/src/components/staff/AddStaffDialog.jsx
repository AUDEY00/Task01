import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import "../../styles/dialog.css";

// "Add Staff" popup. The parent does the saving:
// onAdd({ name, role, imageFile }) must resolve to true when saved.
export default function AddStaffDialog({ onAdd, onClose }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // Close with the Escape key.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, saving]);

  function handleFileChange(event) {
    const file = event.target.files[0];

    if (!file) {
      setImageFile(null);
      return;
    }

    // Make sure the selected file is an image
    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "warning",
        title: "Invalid File",
        text: "Please select an image file.",
      });

      event.target.value = "";
      setImageFile(null);
      return;
    }

    setImageFile(file);
  }

  async function handleSubmit() {
    if (saving) return;

    setSaving(true);
    const added = await onAdd({ name, role, imageFile });

    if (added) {
      onClose();
    } else {
      setSaving(false);
    }
  }

  // Pressing Enter in a text field saves, like the old form.
  function handleEnter(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  }

  // Rendered directly in <body> so the page layout can never affect it.
  return createPortal(
    <div className="dialog-backdrop">
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-staff-title"
      >
        <div className="staff-details-dialog">
          <h2 id="add-staff-title">Add Staff</h2>

          {/* Full Name */}
          <div className="staff-detail">
            <strong>Full Name:</strong>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleEnter}
              autoFocus
            />
          </div>

          {/* Role */}
          <div className="staff-detail">
            <strong>Role:</strong>
            <input
              type="text"
              placeholder="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onKeyDown={handleEnter}
            />
          </div>

          {/* Profile Picture */}
          <div className="staff-detail">
            <strong>Profile Picture:</strong>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="dialog-actions">
          <button
            type="button"
            className="dialog-btn primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Adding..." : "Add Staff"}
          </button>

          <button
            type="button"
            className="dialog-btn"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
