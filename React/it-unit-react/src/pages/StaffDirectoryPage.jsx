import { useCallback, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

import { useAuth } from "../hooks/useAuth";
import { useStaff } from "../hooks/useStaff";
import {
  createStaff,
  deleteStaff,
  generateStaffId,
  updateStaffStatus,
} from "../services/staffService";
import { uploadProfileImage } from "../services/cloudinaryService";
import { exportCSV, exportExcel, exportPDF } from "../services/exportService";
import { readStaffFile } from "../services/importService";
import { showToast } from "../utils/toast";

import StaffToolbar from "../components/staff/StaffToolbar";
import StaffTable from "../components/staff/StaffTable";
import StaffDetailsDialog from "../components/staff/StaffDetailsDialog";
import AddStaffDialog from "../components/staff/AddStaffDialog";

import { Compass } from "lucide-react";
import "../styles/staff-directory.css";

export default function StaffDirectoryPage() {
  const { user } = useAuth();
  const { staffList } = useStaff();

  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // Numbers shown on the Active / Inactive tabs.
  const activeCount = useMemo(
    () => staffList.filter((staff) => staff.status === "Active").length,
    [staffList]
  );
  const inactiveCount = useMemo(
    () => staffList.filter((staff) => staff.status === "Inactive").length,
    [staffList]
  );

  // Only show Active or Inactive staff (depending on the tab),
  // narrowed down by whatever is typed in the search box.
  const visibleStaff = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return staffList.filter((staff) => {
      const matchesStatus = showInactiveOnly
        ? staff.status === "Inactive"
        : staff.status === "Active";

      const matchesSearch =
        term === "" ||
        `${staff.name || ""} ${staff.role || ""}`.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [staffList, showInactiveOnly, searchTerm]);

  const closeDialog = useCallback(() => setEditingStaff(null), []);
  const closeAddDialog = useCallback(() => setAddDialogOpen(false), []);

  // -----------------------------------
  // Add Staff
  // Resolves to true when saved (so the form clears itself).
  // -----------------------------------
  async function handleAddStaff({ name, role, imageFile }) {
    const trimmedName = name.trim();
    const trimmedRole = role.trim();

    if (trimmedName === "" || trimmedRole === "") {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Please enter both the Full Name and Role.",
      });
      return false;
    }

    let profileUrl = "";

    // Upload Image to Cloudinary (optional)
    if (imageFile) {
      try {
        const uploaded = await uploadProfileImage(imageFile);
        profileUrl = uploaded.url;
      } catch (error) {
        console.error("Cloudinary upload error:", error);

        Swal.fire({
          icon: "error",
          title: "Image Upload Failed",
          text: "The profile image could not be uploaded.",
        });
        return false;
      }
    }

    // Save Staff to Firestore (new staff always start as Inactive)
    const newStaff = {
      id: generateStaffId(),
      name: trimmedName,
      role: trimmedRole,
      status: "Inactive",
      profileUrl,
    };

    try {
      await createStaff(newStaff);
      showToast(`${trimmedName} added successfully.`);
      return true;
    } catch (error) {
      console.error("Firestore write error:", error);

      Swal.fire({
        icon: "error",
        title: "Add Staff Failed",
        text: "The staff member could not be added.",
      });
      return false;
    }
  }

  // -----------------------------------
  // Activate / Deactivate
  // -----------------------------------
  async function handleToggleStatus(staff) {
    const newStatus = staff.status === "Active" ? "Inactive" : "Active";

    try {
      await updateStaffStatus(staff.id, newStatus);
      showToast(`${staff.name} is now ${newStatus}`);
    } catch (error) {
      console.error("Firestore update error:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update staff status. Please try again.",
      });
    }
  }

  // -----------------------------------
  // Delete
  // -----------------------------------
  async function handleDelete(staff) {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete Staff",
      text: `Are you sure you want to delete ${staff.name}?`,
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteStaff(staff.id);
      showToast(`${staff.name} has been deleted.`);
    } catch (error) {
      console.error("Firestore delete error:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete staff member. Please try again.",
      });
    }
  }

  // -----------------------------------
  // Export (exports ALL staff, like the old app)
  // -----------------------------------
  function handleExportExcel() {
    exportExcel(staffList);
    showToast("Staff directory exported to Excel.");
  }

  function handleExportCSV() {
    exportCSV(staffList);
    showToast("Staff directory exported to CSV.");
  }

  function handleExportPDF() {
    exportPDF(staffList);
    showToast("Staff directory exported to PDF.");
  }

  // -----------------------------------
  // Import (Excel / CSV)
  // -----------------------------------
  async function handleImport(file) {
    let result;

    try {
      result = await readStaffFile(file);
    } catch (error) {
      console.error("Import error:", error);

      Swal.fire({
        icon: "error",
        title: "Import Failed",
        text: "The selected file could not be read. Please make sure you are importing a valid Excel or CSV file.",
      });
      return;
    }

    if (result.error) {
      Swal.fire({
        icon: "warning",
        title: result.error.title,
        text: result.error.text,
      });
      return;
    }

    // ID is generated automatically. Status is always Inactive.
    const newRecords = result.records.map((record) => ({
      id: generateStaffId(),
      name: record.name,
      role: record.role,
      status: "Inactive",
    }));

    try {
      await Promise.all(newRecords.map((record) => createStaff(record)));

      showToast(`${newRecords.length} staff record(s) imported successfully.`);
    } catch (error) {
      console.error("Firebase import error:", error);

      Swal.fire({
        icon: "error",
        title: "Import Failed",
        text: "The staff records were found, but an error occurred while saving them to Firebase.",
      });
    }
  }

  // -----------------------------------
  // Guided Tour
  // -----------------------------------
  function startTour() {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,

      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Finish",

      progressText: "{{current}} of {{total}}",

      steps: [
        {
          element: "#tour-navigation",
          popover: {
            title: "Navigation",
            description:
              "Use the sidebar to navigate through the IT Unit Management System. From here, you can access the Dashboard and Map.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#tour-user",
          popover: {
            title: "Logged-in Account",
            description:
              "This section displays the email address of the currently authenticated user.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#tour-add-staff",
          popover: {
            title: "Add Staff",
            description:
              "Click Add staff to open the form. Enter the Full Name and Role, optionally choose a profile picture, then save.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: "#tour-controls",
          popover: {
            title: "Staff Controls",
            description:
              "Switch between Active and Inactive staff, search by name or role, import staff records, or export your data to Excel, CSV, or PDF.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#tour-staff-table",
          popover: {
            title: "Staff Directory",
            description:
              "This table displays your staff records. Use the icons on the right to view details, activate or deactivate a staff member, or delete a record.",
            side: "top",
            align: "start",
          },
        },
        {
          element: "#tour-logout",
          popover: {
            title: "Logout",
            description:
              "When you are finished using the system, use the Logout button to securely sign out of your account.",
            side: "right",
            align: "start",
          },
        },
        {
          popover: {
            title: "You're All Set!",
            description:
              "You now know the main features of the IT Unit Management System. You can start managing staff records and exploring the Map.",
          },
        },
      ],
    });

    driverObj.drive();
  }

  return (
    <div className="staff-page">
      <div className="staff-card">
        {/* Header */}
        <div className="staff-card-header">
          <div>
            <h1>IT Unit Directory</h1>

            {user && (
              <span className="staff-subtitle" id="tour-user">
                Logged in as: {user.email}
              </span>
            )}
          </div>

          <button type="button" className="tool-btn" onClick={startTour}>
            <Compass size={16} aria-hidden="true" />
            Guided tour
          </button>
        </div>

        {/* Toolbar */}
        <StaffToolbar
          showInactiveOnly={showInactiveOnly}
          activeCount={activeCount}
          inactiveCount={inactiveCount}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelectView={setShowInactiveOnly}
          onImport={handleImport}
          onExportExcel={handleExportExcel}
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
          onAddClick={() => setAddDialogOpen(true)}
        />

        {/* Staff Table */}
        <StaffTable
          staffList={visibleStaff}
          onViewDetails={setEditingStaff}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      </div>

      {/* Add Staff Dialog */}
      {addDialogOpen && (
        <AddStaffDialog onAdd={handleAddStaff} onClose={closeAddDialog} />
      )}

      {/* Edit Staff Details Dialog */}
      {editingStaff && (
        <StaffDetailsDialog
          key={editingStaff.id}
          staff={editingStaff}
          onClose={closeDialog}
        />
      )}
    </div>
  );
}
