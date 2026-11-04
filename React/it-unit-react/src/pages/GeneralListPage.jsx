import { useState } from "react";
import Swal from "sweetalert2";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { Compass, Plus, SlidersHorizontal, Table as TableIcon } from "lucide-react";

import { useGeneralLists } from "../hooks/useGeneralLists";
import { deleteList, saveRecords } from "../services/generalListService";

import ListSwitcher from "../components/generalList/ListSwitcher";
import ListActionsMenu from "../components/generalList/ListActionsMenu";
import RecordsTable from "../components/generalList/RecordsTable";
import ListFormDialog from "../components/generalList/ListFormDialog";
import RecordDialog from "../components/generalList/RecordDialog";

import "../styles/general-list.css";

const STORAGE_KEY = "generalListSelectedId";

// The list that was open last time (remembered between visits).
function readStoredListId() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeListId(id) {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable: the choice just isn't remembered.
  }
}

export default function GeneralListPage() {
  const { lists, loading } = useGeneralLists();

  const [selectedId, setSelectedId] = useState(readStoredListId);

  // Which popup is open:
  //   { type: "createList" } | { type: "editList" } |
  //   { type: "addRecord" }  | { type: "editRecord", index }
  const [dialog, setDialog] = useState(null);

  // Always the newest version of the open list. If the list is deleted
  // (here or on another device) this becomes null and the page resets.
  const selectedList = lists.find((list) => list.id === selectedId) || null;

  const closeDialog = () => setDialog(null);

  function selectList(id) {
    setSelectedId(id);
    storeListId(id);
  }

  // -----------------------------------
  // Delete Record
  // -----------------------------------
  async function handleDeleteRecord(recordIndex) {
    if (!selectedList) return;

    if (recordIndex < 0 || recordIndex >= selectedList.records.length) {
      Swal.fire({
        icon: "error",
        title: "Record Not Found",
        text: "The record could not be found.",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Delete Record?",
      text: "Are you sure you want to delete this record?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    // Remove the selected record
    const updatedRecords = selectedList.records.filter(
      (_, index) => index !== recordIndex
    );

    try {
      await saveRecords(selectedList.id, updatedRecords);

      Swal.fire({
        icon: "success",
        title: "Record Deleted",
        text: "The record was deleted successfully.",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("FIRESTORE DELETE RECORD ERROR:", error);

      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error.message || "Unable to delete the record.",
      });
    }
  }

  // -----------------------------------
  // Delete List
  // -----------------------------------
  async function handleDeleteList() {
    if (!selectedList) return;

    const listId = selectedList.id;
    const listName = selectedList.name;

    const result = await Swal.fire({
      title: "Delete List?",
      text: `Are you sure you want to delete ${listName}? All records inside this list will also be removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteList(listId);

      selectList(null);

      Swal.fire({
        icon: "success",
        title: "List Deleted",
        text: `${listName} was deleted successfully.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error deleting General List:", error);

      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: "Unable to delete the list.",
      });
    }
  }

  // -----------------------------------
  // Guided Tour
  // -----------------------------------
  function startTour() {
    const tour = driver({
      showProgress: true,

      steps: [
        {
          element: "#tour-navigation",
          popover: {
            title: "Navigation",
            description:
              "Use the sidebar to move between the Dashboard, Location Map, and General Lists.",
          },
        },
        {
          element: "#tour-list-panel",
          popover: {
            title: "Existing Lists",
            description:
              "This switcher shows the list you are working on. Click it to search all the general lists stored in the system and open one.",
          },
        },
        {
          element: "#tour-create-list",
          popover: {
            title: "Create New List",
            description:
              "Create a new general list by defining its name, columns, and column types.",
          },
        },
        {
          element: "#tour-edit-list",
          popover: {
            title: "Edit List",
            description:
              "Use this button to modify the selected list, including its name, columns, and column types.",
          },
        },
        {
          element: "#tour-delete-list",
          popover: {
            title: "Delete List",
            description:
              "Open this menu to delete the selected list. Deleting a list also removes all records stored inside it.",
          },
        },
        {
          element: "#tour-list-table",
          popover: {
            title: "List Records",
            description:
              "View the records belonging to the selected general list. Search them above the table, and use the pencil and trash icons to edit or delete a record.",
          },
        },
        {
          element: "#tour-add-record",
          popover: {
            title: "Add Record",
            description:
              "Add a new record using the columns defined for the selected list.",
          },
        },
        {
          element: "#tour-logout",
          popover: {
            title: "Logout",
            description: "Use this button to securely sign out of the system.",
          },
        },
      ],
    });

    tour.drive();
  }

  return (
    <div className="general-list-page">
      {/* Page Header */}
      <div className="gl-page-header">
        <div>
          <h1>General Lists</h1>

          <p>Manage dynamic lists and their records.</p>
        </div>

        <button type="button" className="gl-btn" onClick={startTour}>
          <Compass size={16} aria-hidden="true" />
          Guided tour
        </button>
      </div>

      <section className="gl-card">
        {/* List switcher + list actions */}
        <div className="gl-top">
          <ListSwitcher
            lists={lists}
            selectedList={selectedList}
            loading={loading}
            onSelect={(list) => selectList(list.id)}
            onCreate={() => setDialog({ type: "createList" })}
          />

          <div className="gl-top-actions">
            <button
              type="button"
              className="gl-btn"
              id="tour-create-list"
              title="Create a new list"
              aria-label="New list"
              onClick={() => setDialog({ type: "createList" })}
            >
              <Plus size={16} aria-hidden="true" />
              <span className="btn-label">New list</span>
            </button>

            {selectedList && (
              <>
                <button
                  type="button"
                  className="gl-btn"
                  id="tour-edit-list"
                  title="Edit the name and columns of this list"
                  aria-label="Edit list"
                  onClick={() => setDialog({ type: "editList" })}
                >
                  <SlidersHorizontal size={16} aria-hidden="true" />
                  <span className="btn-label">Edit list</span>
                </button>

                <ListActionsMenu onDelete={handleDeleteList} />
              </>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && <p className="gl-state">Loading lists...</p>}

        {/* Records of the open list */}
        {!loading && selectedList && (
          <RecordsTable
            key={selectedList.id}
            list={selectedList}
            onAddRecord={() => setDialog({ type: "addRecord" })}
            onEditRecord={(index) => setDialog({ type: "editRecord", index })}
            onDeleteRecord={handleDeleteRecord}
          />
        )}

        {/* No List Selected */}
        {!loading && !selectedList && (
          <div className="gl-empty-selection">
            <div className="gl-empty-icon">
              <TableIcon size={28} aria-hidden="true" />
            </div>

            <h2>{lists.length === 0 ? "No lists yet" : "Select a List"}</h2>

            <p>
              {lists.length === 0
                ? "Create your first list to start storing records."
                : "Choose a list from the switcher above to view and manage its records."}
            </p>

            {lists.length === 0 && (
              <button
                type="button"
                className="gl-btn primary"
                onClick={() => setDialog({ type: "createList" })}
              >
                <Plus size={16} aria-hidden="true" />
                Create your first list
              </button>
            )}
          </div>
        )}
      </section>

      {/* Popups */}
      {dialog?.type === "createList" && (
        <ListFormDialog
          mode="create"
          onClose={closeDialog}
          onCreated={selectList}
        />
      )}

      {selectedList && dialog?.type === "editList" && (
        <ListFormDialog
          key={selectedList.id}
          mode="edit"
          list={selectedList}
          onClose={closeDialog}
        />
      )}

      {selectedList && dialog?.type === "addRecord" && (
        <RecordDialog
          key={selectedList.id}
          mode="add"
          list={selectedList}
          onClose={closeDialog}
        />
      )}

      {selectedList && dialog?.type === "editRecord" && (
        <RecordDialog
          key={`${selectedList.id}-${dialog.index}`}
          mode="edit"
          list={selectedList}
          recordIndex={dialog.index}
          onClose={closeDialog}
        />
      )}
    </div>
  );
}
