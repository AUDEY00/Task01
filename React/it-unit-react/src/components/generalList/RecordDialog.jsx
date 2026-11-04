import { useState } from "react";
import Swal from "sweetalert2";
import GeneralListDialog from "./GeneralListDialog";
import { saveRecords } from "../../services/generalListService";
import {
  emptyRecordValues,
  recordToFormValues,
  validateRecord,
} from "../../utils/generalList";

export default function RecordDialog({ mode, list, recordIndex, onClose }) {
  const isEdit = mode === "edit";

  const [values, setValues] = useState(() =>
    isEdit
      ? recordToFormValues(list.records[recordIndex], list.columns)
      : emptyRecordValues(list.columns)
  );
  const [saving, setSaving] = useState(false);

  function setValue(columnName, value) {
    setValues((current) => ({ ...current, [columnName]: value }));
  }

  async function handleSubmit() {
    if (saving) return;

    // Validate fields
    const result = validateRecord(values, list.columns);

    if (result.error) {
      Swal.fire({
        icon: "warning",
        title: result.error.title,
        text: result.error.text,
      });
      return;
    }

    // Build the updated records array
    const updatedRecords = [...(list.records || [])];

    if (isEdit) {
      if (recordIndex < 0 || recordIndex >= updatedRecords.length) {
        Swal.fire({
          icon: "error",
          title: "Record Not Found",
          text: "The record could not be found.",
        });
        onClose();
        return;
      }

      updatedRecords[recordIndex] = result.record;
    } else {
      updatedRecords.push(result.record);
    }

    setSaving(true);

    try {
      await saveRecords(list.id, updatedRecords);

      Swal.fire({
        icon: "success",
        title: isEdit ? "Record Updated" : "Record Added",
        text: isEdit
          ? "The record was updated successfully."
          : "The record was added successfully.",
        timer: 1200,
        showConfirmButton: false,
      });

      onClose();
    } catch (error) {
      console.error(
        isEdit ? "FIRESTORE UPDATE RECORD ERROR:" : "FIRESTORE ADD RECORD ERROR:",
        error
      );

      Swal.fire({
        icon: "error",
        title: isEdit ? "Update Failed" : "Add Failed",
        text:
          error.message ||
          (isEdit ? "Unable to update the record." : "Unable to save the record."),
      });

      setSaving(false);
    }
  }

  return (
    <GeneralListDialog
      title={isEdit ? `Edit Record in ${list.name}` : `Add Record to ${list.name}`}
      className="record-dialog"
      busy={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
      actions={
        <>
          <button
            type="button"
            className="md-btn"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="md-btn raised primary"
            disabled={saving}
          >
            {saving
              ? isEdit ? "Saving..." : "Adding..."
              : isEdit ? "Save Changes" : "Add Record"}
          </button>
        </>
      }
    >
      <div className="record-fields">
        {list.columns.map((column, index) => {
          const id = `recordField${index}`;

          return (
            <div className="form-group" key={`${index}-${column.name}`}>
              <label htmlFor={id}>{column.name}</label>

              {/* TEXT (also used when a column has no / an unknown type) */}
              {!["number", "date", "boolean"].includes(column.type) && (
                <input
                  type="text"
                  id={id}
                  value={values[column.name]}
                  placeholder={`Enter ${column.name}`}
                  onChange={(e) => setValue(column.name, e.target.value)}
                  autoFocus={index === 0}
                />
              )}

              {/* NUMBER */}
              {column.type === "number" && (
                <input
                  type="number"
                  id={id}
                  step="any"
                  value={values[column.name]}
                  placeholder={`Enter ${column.name}`}
                  onChange={(e) => setValue(column.name, e.target.value)}
                  autoFocus={index === 0}
                />
              )}

              {/* DATE */}
              {column.type === "date" && (
                <input
                  type="date"
                  id={id}
                  value={values[column.name]}
                  onChange={(e) => setValue(column.name, e.target.value)}
                  autoFocus={index === 0}
                />
              )}

              {/* BOOLEAN */}
              {column.type === "boolean" && (
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={Boolean(values[column.name])}
                    onChange={(e) => setValue(column.name, e.target.checked)}
                  />

                  <span>{column.name}</span>
                </label>
              )}
            </div>
          );
        })}
      </div>
    </GeneralListDialog>
  );
}
