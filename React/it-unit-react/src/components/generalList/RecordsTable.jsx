import { useMemo, useState } from "react";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Hash,
  Minus,
  Pencil,
  Plus,
  Search,
  ToggleLeft,
  Trash2,
  Type,
} from "lucide-react";
import {
  formatCellValue,
  formatDateDisplay,
  paginate,
  pluralize,
  recordMatchesSearch,
} from "../../utils/generalList";

const PAGE_SIZES = [10, 25, 50, 100];

// Small icon in each column header showing the column type.
const TYPE_ICONS = {
  text: Type,
  number: Hash,
  date: Calendar,
  boolean: ToggleLeft,
};

// What one table cell shows.
function renderCell(value, column) {
  // Yes / no columns show a check or a dash instead of true / false.
  if (typeof value === "boolean") {
    return value ? (
      <span className="bool-yes" title="Yes">
        <Check size={17} aria-hidden="true" />
        <span className="gl-sr-only">Yes</span>
      </span>
    ) : (
      <span className="bool-no" title="No">
        <Minus size={17} aria-hidden="true" />
        <span className="gl-sr-only">No</span>
      </span>
    );
  }

  if (column.type === "date") {
    return formatDateDisplay(value) || formatCellValue(value);
  }

  return formatCellValue(value);
}

// Toolbar (search + Add record), the dynamic table and the paging footer.
// Render it with  key={list.id}  so search and page reset for each list.
export default function RecordsTable({
  list,
  onAddRecord,
  onEditRecord,
  onDeleteRecord,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  // Remember each record's real position in the list: Edit and Delete work
  // on that position, even while the table is filtered or paged.
  const matchingRows = useMemo(
    () =>
      list.records
        .map((record, index) => ({ record, index }))
        .filter(({ record }) =>
          recordMatchesSearch(record, list.columns, searchTerm)
        ),
    [list.records, list.columns, searchTerm]
  );

  const { pageCount, currentPage, start, end } = paginate(
    matchingRows.length,
    page,
    pageSize
  );

  const pageRows = matchingRows.slice(start, end);

  const totalRecords = list.records.length;
  const isSearching = searchTerm.trim() !== "";

  function handleSearchChange(term) {
    setSearchTerm(term);
    setPage(0);
  }

  function handlePageSizeChange(event) {
    setPageSize(Number(event.target.value));
    setPage(0);
  }

  return (
    <div className="records-section">
      {/* Toolbar */}
      <div className="records-toolbar">
        <div className="search-box">
          <Search size={16} aria-hidden="true" />
          <input
            type="text"
            placeholder="Search records"
            aria-label="Search records"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="gl-btn primary"
          id="tour-add-record"
          onClick={onAddRecord}
        >
          <Plus size={16} aria-hidden="true" />
          Add record
        </button>
      </div>

      {/* Dynamic Table */}
      <div className="records-scroll">
        <table
          className="records-table"
          id="tour-list-table"
          style={{ minWidth: Math.max(480, list.columns.length * 150 + 100) }}
        >
          <thead>
            <tr>
              {/* Dynamic Columns */}
              {list.columns.map((column, index) => {
                const Icon = TYPE_ICONS[column.type] || Type;

                return (
                  <th
                    key={`${index}-${column.name}`}
                    className={column.type === "number" ? "align-right" : ""}
                  >
                    <span className="th-inner">
                      <Icon size={13} aria-hidden="true" />
                      {column.name}
                    </span>
                  </th>
                );
              })}

              {/* Actions */}
              <th className="col-actions">
                <span className="gl-sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {pageRows.map(({ record, index }) => (
              <tr key={index}>
                {list.columns.map((column, columnIndex) => (
                  <td
                    key={`${columnIndex}-${column.name}`}
                    className={column.type === "number" ? "align-right" : ""}
                  >
                    {renderCell(record[column.name], column)}
                  </td>
                ))}

                <td className="col-actions">
                  <button
                    type="button"
                    className="icon-btn"
                    title="Edit record"
                    aria-label={`Edit record ${index + 1}`}
                    onClick={() => onEditRecord(index)}
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    className="icon-btn danger"
                    title="Delete record"
                    aria-label={`Delete record ${index + 1}`}
                    onClick={() => onDeleteRecord(index)}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}

            {/* Empty State */}
            {matchingRows.length === 0 && (
              <tr>
                <td colSpan={list.columns.length + 1} className="records-empty">
                  {totalRecords === 0
                    ? "No records found."
                    : "No records match your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer: count + paging */}
      <div className="records-footer">
        <span className="footer-info">
          {matchingRows.length === 0
            ? pluralize(totalRecords, "record")
            : `Showing ${start + 1}–${end} of ${matchingRows.length}`}
          {isSearching && matchingRows.length > 0
            ? ` (${totalRecords} total)`
            : ""}
        </span>

        <div className="footer-controls">
          <label className="page-size">
            Rows
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              aria-label="Rows per page"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <span className="page-indicator">
            Page {currentPage + 1} of {pageCount}
          </span>

          <button
            type="button"
            className="pager-btn"
            aria-label="Previous page"
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="pager-btn"
            aria-label="Next page"
            disabled={currentPage >= pageCount - 1}
            onClick={() => setPage(currentPage + 1)}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
