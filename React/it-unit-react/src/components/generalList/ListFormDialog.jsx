import { useRef, useState } from "react";
import Swal from "sweetalert2";
import GeneralListDialog from "./GeneralListDialog";
import { createList, updateList } from "../../services/generalListService";
import {
  COLUMN_TYPES,
  applyColumnChanges,
  createDraftFromList,
  toStoredColumns,
  validateListDefinition,
} from "../../utils/generalList";


export default function ListFormDialog({ mode, list, onClose, onCreated }) {
  const isEdit = mode === "edit";

  const newColumnCount = useRef(0);

  const [name, setName] = useState(() => (isEdit ? list.name || "" : ""));


  const [columns, setColumns] = useState(() => {
    const initial = isEdit ? createDraftFromList(list).columns : [];

    return initial.map((column, index) => ({
      ...column,
      key: `existing-${index}`,
    }));
  });

  const [saving, setSaving] = useState(false);

  function addColumn() {
    
    const key = `new-${newColumnCount.current}`;
    newColumnCount.current += 1;

    setColumns((current) => [
      ...current,
      { key, name: "", type: "text", originalName: undefined },
    ]);
  }

  function removeColumn(key) {
    setColumns((current) => current.filter((column) => column.key !== key));
  }

  function updateColumn(key, changes) {
    setColumns((current) =>
      current.map((column) =>
        column.key === key ? { ...column, ...changes } : column
      )
    );
  }

  async function handleSubmit() {
    if (saving) return;

    const result = validateListDefinition({ name, columns }, mode);

    if (result.error) {
      Swal.fire({
        icon: "warning",
        title: result.error.title,
        text: result.error.text,
      });
      return;
    }

    const cleanName = result.values.name;
    const cleanColumns = result.values.columns;

    setSaving(true);

    try {
      if (isEdit) {
        // Carry the records over to the new columns (renames / deletions).
        const records = applyColumnChanges(list.records, cleanColumns);

        await updateList(list.id, {
          name: cleanName,
          columns: toStoredColumns(cleanColumns),
          records,
        });

        Swal.fire({
          icon: "success",
          title: "List Updated",
          text: `${cleanName} was updated successfully.`,
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        const newId = await createList({
          name: cleanName,
          columns: toStoredColumns(cleanColumns),
        });

        // Lets the page open the new list right away.
        if (onCreated) onCreated(newId);

        Swal.fire({
          icon: "success",
          title: "List Created",
          text: `${cleanName} was created successfully.`,
          timer: 1500,
          showConfirmButton: false,
        });
      }

      onClose();
    } catch (error) {
      console.error(isEdit ? "Error updating General List:" : "Error creating list:", error);

      Swal.fire({
        icon: "error",
        title: isEdit ? "Update Failed" : "Create Failed",
        text: isEdit ? "Unable to update the list." : "Unable to create the list.",
      });

      setSaving(false);
    }
  }

  return (
    <GeneralListDialog
      title={isEdit ? "Edit List" : "Create New List"}
      className="general-list-dialog"
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
              ? isEdit ? "Saving..." : "Creating..."
              : isEdit ? "Save Changes" : "Create List"}
          </button>
        </>
      }
    >
      <div className="dialog-content">
        {/* List Name */}
        <div className="md-field">
          <label htmlFor="listName">List Name</label>
          <input
            type="text"
            id="listName"
            value={name}
            placeholder={isEdit ? undefined : "e.g. Department"}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        {/* Columns */}
        <div className="columns-section">
          <div className="columns-header">
            <div>
              <h3>Columns</h3>
              <p>
                {isEdit
                  ? "Modify the columns for this list."
                  : "Define the columns for this list."}
              </p>
            </div>

            <button type="button" className="md-btn raised" onClick={addColumn}>
              ＋ Add Column
            </button>
          </div>

          {columns.length > 0 && (
            <div className="column-builder">
              {columns.map((column, index) => (
                <div className="column-row" key={column.key}>
                  {/* Column Name */}
                  <div className="md-field">
                    <label htmlFor={`columnName${column.key}`}>Column Name</label>
                    <input
                      type="text"
                      id={`columnName${column.key}`}
                      value={column.name}
                      placeholder="Column name"
                      onChange={(e) =>
                        updateColumn(column.key, { name: e.target.value })
                      }
                    />
                  </div>

                  {/* Column Type */}
                  <div className="md-field">
                    <label htmlFor={`columnType${column.key}`}>Type</label>
                    <select
                      id={`columnType${column.key}`}
                      value={column.type}
                      onChange={(e) =>
                        updateColumn(column.key, { type: e.target.value })
                      }
                    >
                      {COLUMN_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    className="md-icon-btn remove-column"
                    aria-label={`Remove column ${index + 1}`}
                    title="Remove column"
                    onClick={() => removeColumn(column.key)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}

          {columns.length === 0 && (
            <div className="no-columns">
              <span>
                {isEdit ? "No columns available." : "No columns added yet."}
              </span>

              <button type="button" onClick={addColumn}>
                Add your first column
              </button>
            </div>
          )}
        </div>
      </div>
    </GeneralListDialog>
  );
}
