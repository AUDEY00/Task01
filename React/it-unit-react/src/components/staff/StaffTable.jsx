import { Eye, Trash2, UserCheck, UserX } from "lucide-react";

// First letter of the first and last word: "Maria Santos" -> "MS"
function getInitials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "?";

  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";

  return (first + last).toUpperCase();
}

// Staff table. "staffList" must already be filtered (Active / Inactive / search).
export default function StaffTable({
  staffList,
  onViewDetails,
  onToggleStatus,
  onDelete,
}) {
  return (
    <div className="staff-table-scroll" id="tour-staff-table">
      <table className="staff-table">
        <thead>
          <tr>
            <th>Staff</th>
            <th className="col-status">Status</th>
            <th className="col-actions">Actions</th>
          </tr>
        </thead>

        <tbody>
          {staffList.map((staff) => {
            const isActive = staff.status === "Active";

            return (
              <tr key={staff.id}>
                {/* Photo + name + role */}
                <td>
                  <div className="staff-cell">
                    {staff.profileUrl ? (
                      <img
                        src={staff.profileUrl}
                        alt={staff.name}
                        className="avatar"
                      />
                    ) : (
                      <div className="avatar avatar-initials" aria-hidden="true">
                        {getInitials(staff.name)}
                      </div>
                    )}

                    <div className="staff-text">
                      <p className="staff-name">{staff.name}</p>
                      <p className="staff-role">{staff.role}</p>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td>
                  <span className={isActive ? "status-pill active" : "status-pill inactive"}>
                    {staff.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="actions-cell">
                  <button
                    type="button"
                    className="icon-btn"
                    title="View details"
                    aria-label={`View details of ${staff.name}`}
                    onClick={() => onViewDetails(staff)}
                  >
                    <Eye size={18} aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    className="icon-btn"
                    title={isActive ? "Deactivate" : "Activate"}
                    aria-label={`${isActive ? "Deactivate" : "Activate"} ${staff.name}`}
                    onClick={() => onToggleStatus(staff)}
                  >
                    {isActive ? (
                      <UserX size={18} aria-hidden="true" />
                    ) : (
                      <UserCheck size={18} aria-hidden="true" />
                    )}
                  </button>

                  <button
                    type="button"
                    className="icon-btn danger"
                    title="Delete"
                    aria-label={`Delete ${staff.name}`}
                    onClick={() => onDelete(staff)}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            );
          })}

          {staffList.length === 0 && (
            <tr>
              <td colSpan={3} className="staff-empty">
                No staff members found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
