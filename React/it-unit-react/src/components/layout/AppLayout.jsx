import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

// Sidebar + page content (same structure as the old Main.html).
export default function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
