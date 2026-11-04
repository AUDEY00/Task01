import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import { uploadProfileImage } from "../../services/cloudinaryService";
import { updateStaffDetails } from "../../services/staffService";
import { showToast } from "../../utils/toast";
import "../../styles/dialog.css";

// "Edit Staff Details" dialog (replaces View/staff-details.html + $mdDialog).
// Name, role and profile picture can be changed. ID and status are read-only.
export default function StaffDetailsDialog({ staff, onClose }) {
  // Work on a copy so nothing changes until "Save Changes" is clicked.
  const [name, setName] = useState(staff.name || "");
  const [role, setRole] = useState(staff.role || "");
  const [newImage, setNewImage] = useState(null);
  const [saving, setSaving] = useState(false);

  // Close with the Escape key (like Angular Material dialogs).
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, saving]);

  async function handleSave() {
    const trimmedName = name.trim();
    const trimmedRole = role.trim();

    // Validate fields
    if (trimmedName === "" || trimmedRole === "") {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Please enter both the Full Name and Role.",
      });
      return;
    }

    setSaving(true);

    let profileUrl = staff.profileUrl || "";
    let cloudinaryPublicId = staff.cloudinaryPublicId || "";

    // Upload the new image first (if one was chosen)
    if (newImage) {
      try {
        const uploaded = await uploadProfileImage(newImage);
        profileUrl = uploaded.url;
        cloudinaryPublicId = uploaded.publicId;
      } catch (error) {
        console.error("Cloudinary upload error:", error);

        Swal.fire({
          icon: "error",
          title: "Image Upload Failed",
          text: "The new profile image could not be uploaded.",
        });

        setSaving(false);
        return;
      }
    }

    // Save to Firestore
    try {
      await updateStaffDetails(staff.id, {
        name: trimmedName,
        role: trimmedRole,
        profileUrl,
        cloudinaryPublicId,
      });

      onClose();
      showToast(`${trimmedName}'s details updated successfully.`);
    } catch (error) {
      console.error("Firestore update error:", error);

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Failed to update staff member. Please try again.",
      });

      setSaving(false);
    }
  }

  // Rendered directly in <body> so the table/page layout can never affect it.
  return createPortal(
    <div className="dialog-backdrop">
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-dialog-title"
      >
        <div className="staff-details-dialog">
          <h2 id="staff-dialog-title">Edit Staff Details</h2>

          {/* Staff ID */}
          <div className="staff-detail">
            <strong>Staff ID:</strong>
            <span>{staff.id}</span>
          </div>

          {/* Profile Picture */}
          <div className="staff-profile-section">
            <strong>Profile Picture:</strong>

            <div className="profile-preview">
              {staff.profileUrl ? (
                <img
                  src={staff.profileUrl}
                  alt={staff.name}
                  className="profile-preview-image"
                />
              ) : (
                <span>No Image</span>
              )}
            </div>

            <input
              type="file"
              id="editProfileImage"
              accept="image/*"
              onChange={(e) => setNewImage(e.target.files[0] || null)}
            />
          </div>

          {/* Full Name */}
          <div className="staff-detail">
            <strong>Full Name:</strong>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            />
          </div>

          {/* Status */}
          <div className="staff-detail">
            <strong>Status:</strong>

            {staff.status === "Active" && (
              <span className="badge active">Active</span>
            )}
            {staff.status === "Inactive" && (
              <span className="badge inactive">Inactive</span>
            )}
          </div>
        </div>

        <div className="dialog-actions">
          <button
            type="button"
            className="dialog-btn primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
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
