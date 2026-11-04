import { NavLink, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  Map as MapIcon,
  Server,
  Table as TableIcon,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

// Fonts used inside the sidebar only (self-hosted by the npm packages)
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";

import "../../styles/sidebar.css";

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/map", icon: MapIcon, label: "Location Map" },
  { to: "/general-lists", icon: TableIcon, label: "General Lists" },
  { to: "/document-editor", icon: FileText, label: "Document Editor" },
];

// Position of the page we are on in the menu (-1 if it is not in the menu).
function findActiveIndex(pathname) {
  return NAV_ITEMS.findIndex((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to)
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  const activeIndex = findActiveIndex(pathname);

  async function handleLogout() {
    try {
      await logout();
      // ProtectedRoute sends the user to /login automatically.
    } catch (error) {
      console.error("Logout error:", error);

      Swal.fire({
        icon: "error",
        title: "Logout Failed",
        text: "Unable to log out. Please try again.",
      });
    }
  }

  const email = user && user.email ? user.email : "";

  return (
    <aside className="app-sidebar" id="tour-navigation">
      {/* Logo */}
      <div className="sb-brand">
        <span className="sb-brand-tile">
          <Server size={19} aria-hidden="true" />
        </span>

        <span className="sb-brand-text">
          <span className="sb-brand-title">IT Unit</span>
          <span className="sb-brand-sub">Management System</span>
        </span>
      </div>

      <p className="sb-section">MENU</p>

      {/* Menu. "--sb-index" tells the glowing highlight which item to sit on;
          it slides there when the page changes. */}
      <nav
        className="sb-nav"
        aria-label="Main menu"
        style={{ "--sb-index": Math.max(activeIndex, 0) }}
      >
        <span
          className={activeIndex >= 0 ? "sb-indicator" : "sb-indicator hidden"}
          aria-hidden="true"
        >
          <span className="sb-indicator-bar"></span>
        </span>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? "sb-item active" : "sb-item"
              }
            >
              <Icon size={19} aria-hidden="true" />
              <span className="sb-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Signed-in user + Logout */}
      <div className="sb-footer" id="tour-logout">
        {email && (
          <div className="sb-user">
            <span className="sb-avatar" aria-hidden="true">
              {email.charAt(0).toUpperCase()}
            </span>

            <span className="sb-user-text">
              <span className="sb-user-email">{email}</span>
              <span className="sb-user-sub">Signed in</span>
            </span>
          </div>
        )}

        <button
          type="button"
          className="sb-logout"
          aria-label="Logout"
          onClick={handleLogout}
        >
          <LogOut size={18} aria-hidden="true" />
          <span className="sb-logout-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}
