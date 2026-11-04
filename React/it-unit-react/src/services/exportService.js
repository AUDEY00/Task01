import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function toExportRows(staffList) {
  return staffList.map((staff) => ({
    "Staff ID": staff.id,
    "Full Name": staff.name,
    Role: staff.role,
    Status: staff.status,
  }));
}

export function exportExcel(staffList) {
  const worksheet = XLSX.utils.json_to_sheet(toExportRows(staffList));
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Staff Directory");
  XLSX.writeFile(workbook, "staff-directory.xlsx");
}

export function exportCSV(staffList) {
  const worksheet = XLSX.utils.json_to_sheet(toExportRows(staffList));
  const csv = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "staff-directory.csv";
  link.click();

  URL.revokeObjectURL(link.href);
}

export function exportPDF(staffList) {
  const doc = new jsPDF();

  doc.text("IT Unit Directory", 14, 15);

  autoTable(doc, {
    head: [["Staff ID", "Full Name", "Role", "Status"]],
    body: staffList.map((staff) => [
      staff.id,
      staff.name,
      staff.role,
      staff.status,
    ]),
    startY: 25,
  });

  doc.save("staff-directory.pdf");
}
