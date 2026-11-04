// Pure logic for the General Lists feature (no React, no Firebase),
// so it can be tested on its own.
//
// Data model (unchanged from the old app), one Firestore document per list:
//   generalLists/<id> = { name, columns: [{ name, type }], records: [ { <columnName>: value } ] }

export const COLUMN_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "boolean", label: "Boolean" },
];

// 1 -> "1 record", 2 -> "2 records"
export function pluralize(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

// -----------------------------------
// Create / Edit list: validation
// Messages and order of checks match the old controllers.
// -----------------------------------
const LIST_MESSAGES = {
  create: {
    nameText: "Please enter a name for the list.",
    noColumnsTitle: "Column Required",
  },
  edit: {
    nameText: "Please enter a list name.",
    noColumnsTitle: "No Columns",
  },
};

// draft = { name, columns: [{ name, type, originalName? }] }
// Returns { error: { title, text } } or { values: { name, columns } }
export function validateListDefinition(draft, mode) {
  const messages = LIST_MESSAGES[mode];
  const name = String(draft.name ?? "").trim();
  const columns = draft.columns || [];

  if (name === "") {
    return { error: { title: "List Name Required", text: messages.nameText } };
  }

  if (columns.length === 0) {
    return {
      error: {
        title: messages.noColumnsTitle,
        text: "Please add at least one column.",
      },
    };
  }

  for (const column of columns) {
    if (String(column.name ?? "").trim() === "") {
      return {
        error: {
          title: "Column Name Required",
          text: "Please enter a name for every column.",
        },
      };
    }
  }

  // Duplicate names (not case-sensitive). The old app only checked this when
  // editing; creating a list with duplicate columns made them share one value.
  const seen = new Set();

  for (const column of columns) {
    const key = column.name.trim().toLowerCase();

    if (seen.has(key)) {
      return {
        error: {
          title: "Duplicate Column",
          text: "Column names must be unique.",
        },
      };
    }

    seen.add(key);
  }

  return {
    values: {
      name,
      columns: columns.map((column) => ({
        ...column,
        name: column.name.trim(),
        type: column.type || "text",
      })),
    },
  };
}

// Only { name, type } is stored in Firestore.
export function toStoredColumns(columns) {
  return columns.map((column) => ({ name: column.name, type: column.type }));
}

// Starting point for the Edit List dialog. Every column remembers the name it
// had when the dialog opened ("originalName") so that renames and deletions
// can be applied to the records correctly.
export function createDraftFromList(list) {
  return {
    name: list.name || "",
    columns: (list.columns || []).map((column) => ({
      name: column.name,
      type: column.type || "text",
      originalName: column.name,
    })),
  };
}

// -----------------------------------
// Edit list: carry the records over to the new columns.
//
// The old app matched columns by POSITION, so deleting any column except the
// last one shifted the others and scrambled their data. Matching by
// originalName is safe for renames, deletions, new columns and even swapped
// names.
// -----------------------------------
export function applyColumnChanges(records, columns) {
  return (records || []).map((record) => {
    const updated = {};

    columns.forEach((column) => {
      if (
        column.originalName !== undefined &&
        Object.prototype.hasOwnProperty.call(record, column.originalName)
      ) {
        updated[column.name] = record[column.originalName];
      }
    });

    return updated;
  });
}

// -----------------------------------
// Dates
// Dates are saved as "YYYY-MM-DD" text. Records created by the old app may
// hold a Firestore Timestamp or a Date; both are still understood.
// -----------------------------------
function pad(number) {
  return String(number).padStart(2, "0");
}

export function toDateInputValue(value) {
  if (typeof value === "string") {
    return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : "";
  }

  const date =
    value && typeof value.toDate === "function"
      ? value.toDate()
      : value instanceof Date
        ? value
        : null;

  if (!date || Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// What a table cell shows.
export function formatCellValue(value) {
  if (value === null || value === undefined) return "";

  if (typeof value === "boolean") return String(value);

  if (typeof value === "object") {
    if (typeof value.toDate === "function" || value instanceof Date) {
      return toDateInputValue(value);
    }

    return JSON.stringify(value);
  }

  return String(value);
}

// "2026-10-14" (or an old Timestamp) -> "Oct 14, 2026" for the table.
// Falls back to the stored text if it is not a real calendar date.
export function formatDateDisplay(value) {
  const iso = toDateInputValue(value);

  if (!iso) return "";

  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return iso;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// -----------------------------------
// Records table: search and paging
// -----------------------------------

// True if any column of the record contains the search text.
// Dates match both "2026-10-14" and "Oct 14, 2026".
export function recordMatchesSearch(record, columns, searchTerm) {
  const term = String(searchTerm ?? "").trim().toLowerCase();

  if (term === "") return true;

  return columns.some((column) => {
    const value = record[column.name];

    if (formatCellValue(value).toLowerCase().includes(term)) return true;

    return (
      column.type === "date" &&
      formatDateDisplay(value).toLowerCase().includes(term)
    );
  });
}

// Which rows to show. Slice the rows with  rows.slice(start, end).
// The page number is kept inside the valid range (for example after the last
// record of the last page is deleted).
export function paginate(total, page, pageSize) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(page, 0), pageCount - 1);
  const start = total === 0 ? 0 : currentPage * pageSize;
  const end = Math.min(start + pageSize, total);

  return { pageCount, currentPage, start, end };
}

// -----------------------------------
// Records: form values <-> stored record
// -----------------------------------

// Blank form for "Add Record". Checkboxes start unchecked (false).
export function emptyRecordValues(columns) {
  const values = {};

  columns.forEach((column) => {
    values[column.name] = column.type === "boolean" ? false : "";
  });

  return values;
}

// Form values for "Edit Record" (a missing value shows as empty / unchecked).
export function recordToFormValues(record, columns) {
  const values = {};

  columns.forEach((column) => {
    const value = record ? record[column.name] : undefined;

    if (column.type === "boolean") {
      values[column.name] = Boolean(value);
    } else if (column.type === "date") {
      values[column.name] = toDateInputValue(value);
    } else {
      values[column.name] = value === null || value === undefined ? "" : String(value);
    }
  });

  return values;
}

// Checks every column (same "Incomplete Record" message as the old app) and
// converts the form values to what gets stored.
// Returns { error: { title, text } } or { record }.
export function validateRecord(values, columns) {
  const record = {};

  for (const column of columns) {
    const raw = values[column.name];
    const incomplete = {
      error: {
        title: "Incomplete Record",
        text: `Please enter ${column.name}.`,
      },
    };

    if (column.type === "boolean") {
      // A checkbox is always valid: unchecked means false. (The old app
      // refused to save a record until the checkbox had been ticked.)
      record[column.name] = Boolean(raw);
    } else if (column.type === "number") {
      const text = String(raw ?? "").trim();
      const number = text === "" ? NaN : Number(text);

      if (!Number.isFinite(number)) return incomplete;

      record[column.name] = number;
    } else {
      const text = String(raw ?? "").trim();

      if (text === "") return incomplete;

      record[column.name] = text;
    }
  }

  return { record };
}
