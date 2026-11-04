import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Download,
  FileDown,
  FileSpreadsheet,
  FileText,
  Plus,
  Search,
  Upload,
} from "lucide-react";

// Toolbar above the table:
// Active/Inactive tabs, search, Import, Export dropdown, Add staff.
export default function StaffToolbar({
  showInactiveOnly,
  activeCount,
  inactiveCount,
  searchTerm,
  onSearchChange,
  onSelectView,
  onImport,
  onExportExcel,
  onExportCSV,
  onExportPDF,
  onAddClick,
}) {
  const [exportOpen, setExportOpen] = useState(false);

  const exportRef = useRef(null);
  const fileInputRef = useRef(null);

  // Close the Export menu when clicking outside it or pressing Escape.
  useEffect(() => {
    if (!exportOpen) return;

    function handleMouseDown(event) {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setExportOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setExportOpen(false);
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [exportOpen]);

  function runExport(exportFunction) {
    setExportOpen(false);
    exportFunction();
  }

  async function handleImportChange(event) {
    const file = event.target.files[0];

    if (!file) return;

    await onImport(file);

    // Reset so the same file can be chosen again.
    fileInputRef.current.value = "";
  }

  return (
    <div className="staff-toolbar" id="tour-controls">
      {/* Active / Inactive */}
      <div className="segmented" role="group" aria-label="Filter staff by status">
        <button
          type="button"
          className={!showInactiveOnly ? "selected" : ""}
          aria-pressed={!showInactiveOnly}
          onClick={() => onSelectView(false)}
        >
          Active <span className="count">{activeCount}</span>
        </button>

        <button
          type="button"
          className={showInactiveOnly ? "selected" : ""}
          aria-pressed={showInactiveOnly}
          onClick={() => onSelectView(true)}
        >
          Inactive <span className="count">{inactiveCount}</span>
        </button>
      </div>

      {/* Search */}
      <div className="search-box">
        <Search size={16} aria-hidden="true" />
        <input
          type="text"
          placeholder="Search name or role"
          aria-label="Search staff by name or role"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Import */}
      <button
        type="button"
        className="tool-btn"
        title="Import staff from an Excel or CSV file"
        onClick={() => fileInputRef.current.click()}
      >
        <Upload size={16} aria-hidden="true" />
        <span className="btn-label">Import</span>
      </button>

      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        ref={fileInputRef}
        onChange={handleImportChange}
        hidden
      />

      {/* Export dropdown */}
      <div className="export-wrapper" ref={exportRef}>
        <button
          type="button"
          className="tool-btn"
          title="Export all staff"
          aria-haspopup="menu"
          aria-expanded={exportOpen}
          onClick={() => setExportOpen((open) => !open)}
        >
          <Download size={16} aria-hidden="true" />
          <span className="btn-label">Export</span>
          <ChevronDown size={14} aria-hidden="true" />
        </button>

        {exportOpen && (
          <div className="export-menu" role="menu">
            <button type="button" role="menuitem" onClick={() => runExport(onExportExcel)}>
              <FileSpreadsheet size={16} aria-hidden="true" />
              Excel (.xlsx)
            </button>

            <button type="button" role="menuitem" onClick={() => runExport(onExportCSV)}>
              <FileText size={16} aria-hidden="true" />
              CSV (.csv)
            </button>

            <button type="button" role="menuitem" onClick={() => runExport(onExportPDF)}>
              <FileDown size={16} aria-hidden="true" />
              PDF (.pdf)
            </button>
          </div>
        )}
      </div>

      {/* Add staff */}
      <button
        type="button"
        className="tool-btn primary"
        id="tour-add-staff"
        onClick={onAddClick}
      >
        <Plus size={16} aria-hidden="true" />
        Add staff
      </button>
    </div>
  );
}
