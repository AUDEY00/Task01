import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import { updateLocation } from "../../services/locationService";
import { validateLocation } from "../../utils/validateLocation";
import { formatDateMedium } from "../../utils/formatDate";
import "../../styles/dialog.css";
import "../../styles/location-dialog.css";

// "Edit Location" popup (replaces location-details.html + $mdDialog).
// Name and coordinates can be changed. ID and dates are read-only.
export default function LocationDetailsDialog({ location, onClose }) {
  // Work on a copy so nothing changes until "Save Changes" is clicked.
  const [name, setName] = useState(location.name ?? "");
  const [latitude, setLatitude] = useState(String(location.latitude ?? ""));
  const [longitude, setLongitude] = useState(String(location.longitude ?? ""));
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
    if (saving) return;

    const result = validateLocation(
      { name, latitude, longitude },
      "Please enter valid coordinates."
    );

    if (result.error) {
      Swal.fire({
        icon: "warning",
        title: result.error.title,
        text: result.error.text,
      });
      return;
    }

    setSaving(true);

    try {
      await updateLocation(location.id, result.values);

      onClose();

      Swal.fire({
        icon: "success",
        title: "Location Updated",
        text: `${result.values.name} was updated successfully.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Location update error:", error);

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "The location could not be updated.",
      });

      setSaving(false);
    }
  }

  // Pressing Enter in a field saves.
  function handleEnter(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSave();
    }
  }

  // Rendered directly in <body> so the page layout can never affect it.
  return createPortal(
    <div className="dialog-backdrop">
      <div
        className="location-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-dialog-title"
      >
        {/* Header */}
        <div className="location-dialog-header">
          <div className="header-text">
            <h2 id="location-dialog-title">Edit Location</h2>
            <span>Update the location details</span>
          </div>

          <button
            type="button"
            className="close-button"
            aria-label="Close"
            onClick={onClose}
            disabled={saving}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="location-details-dialog">
          {/* Location ID */}
          <div className="location-id-card">
            <div className="detail-icon">📍</div>

            <div>
              <span className="detail-label">Location ID</span>
              <strong>{location.id}</strong>
            </div>
          </div>

          {/* Details */}
          <div className="details-section">
            <h3>Location Details</h3>

            <div className="input-group">
              <label htmlFor="editLocationName">Location Name</label>
              <input
                type="text"
                id="editLocationName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleEnter}
                autoFocus
              />
            </div>

            <div className="coordinate-row">
              <div className="input-group">
                <label htmlFor="editLatitude">Latitude</label>
                <input
                  type="number"
                  id="editLatitude"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  onKeyDown={handleEnter}
                />
              </div>

              <div className="input-group">
                <label htmlFor="editLongitude">Longitude</label>
                <input
                  type="number"
                  id="editLongitude"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  onKeyDown={handleEnter}
                />
              </div>
            </div>
          </div>

          {/* Record information (read-only) */}
          <div className="details-section record-section">
            <h3>Record Information</h3>

            <div className="record-grid">
              <div className="record-item">
                <span className="detail-label">Date Created</span>
                <strong>{formatDateMedium(location.dateCreated)}</strong>
              </div>

              <div className="record-item">
                <span className="detail-label">Date Modified</span>
                <strong>{formatDateMedium(location.dateModified)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="location-dialog-actions">
          <button
            type="button"
            className="cancel-location-button"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="button"
            className="save-location-button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
