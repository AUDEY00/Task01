import * as XLSX from "xlsx";

// Pure function: takes the sheet rows (array of arrays) and returns either
//   { error: { title, text } }   or   { records: [{ name, role }] }
// Behaviour and messages match the old Angular importStaff().
export function parseStaffRows(rows) {
  let headerRowIndex = -1;
  let nameColumnIndex = -1;
  let roleColumnIndex = -1;

  let foundFullName = false;
  let foundRole = false;
  let foundName = false;

  // -----------------------------------
  // Search for Header Row
  // -----------------------------------
  for (let i = 0; i < rows.length; i++) {
    const currentRow = rows[i];

    let rowFullNameIndex = -1;
    let rowRoleIndex = -1;
    let rowNameIndex = -1;

    for (let j = 0; j < currentRow.length; j++) {
      const cellValue = String(currentRow[j]).trim().toLowerCase();

      if (cellValue === "full name") rowFullNameIndex = j;
      if (cellValue === "role") rowRoleIndex = j;
      if (cellValue === "name") rowNameIndex = j;
    }

    if (rowFullNameIndex !== -1) foundFullName = true;
    if (rowRoleIndex !== -1) foundRole = true;
    if (rowNameIndex !== -1) foundName = true;

    // Both required headers on the same row = the header row
    if (rowFullNameIndex !== -1 && rowRoleIndex !== -1) {
      headerRowIndex = i;
      nameColumnIndex = rowFullNameIndex;
      roleColumnIndex = rowRoleIndex;
      break;
    }
  }

  // -----------------------------------
  // Header Validation
  // -----------------------------------
  if (!foundFullName && !foundRole) {
    if (foundName) {
      return {
        error: {
          title: "Cannot Import File",
          text: "The file contains 'Name' and 'Role', but the system requires 'Full Name' and 'Role'.",
        },
      };
    }

    return {
      error: {
        title: "Invalid File",
        text: "The required 'Full Name' and 'Role' headers were not found.",
      },
    };
  }

  if (!foundFullName) {
    if (foundName) {
      return {
        error: {
          title: "Cannot Import File",
          text: "The 'Role' header was found, but 'Full Name' was not found. The file contains 'Name' instead. Please rename 'Name' to 'Full Name'.",
        },
      };
    }

    return {
      error: {
        title: "Cannot Import File",
        text: "The 'Role' header was found, but the required 'Full Name' header is missing.",
      },
    };
  }

  if (!foundRole) {
    return {
      error: {
        title: "Cannot Import File",
        text: "The 'Full Name' header was found, but the required 'Role' header is missing.",
      },
    };
  }

  if (headerRowIndex === -1) {
    return {
      error: {
        title: "Invalid Header Row",
        text: "The 'Full Name' and 'Role' headers were found, but they are not on the same row.",
      },
    };
  }

  // -----------------------------------
  // Collect records (rows after the header row)
  // -----------------------------------
  const records = [];

  for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];

    const name = String(row[nameColumnIndex] || "").trim();
    const role = String(row[roleColumnIndex] || "").trim();

    // Skip incomplete rows
    if (name === "" || role === "") continue;

    records.push({ name, role });
  }

  if (records.length === 0) {
    return {
      error: {
        title: "No Staff Records",
        text: "The required headers were found, but no valid staff records were found in the file.",
      },
    };
  }

  return { records };
}

// Reads an Excel/CSV file and parses it. Throws if the file can't be read.
export async function readStaffFile(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });

  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  });

  return parseStaffRows(rows);
}
