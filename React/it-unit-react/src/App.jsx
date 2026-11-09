import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import StaffDirectoryPage from "./pages/StaffDirectoryPage";
import MapPage from "./pages/MapPage";
import GeneralListPage from "./pages/GeneralListPage";
import DocumentEditorPage from "./pages/DocumentEditorPage";
import VideoBackground from "./components/layout/VideoBackground";

// Keep this LAST: it adjusts the page style sheets loaded above.
import "./styles/theme.css";

export default function App() {
  const { pathname } = useLocation();
  return (
    <>
      {pathname.replace(/\/+$/, '').toLowerCase() !== '/login' && <VideoBackground />}

      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Everything below requires login */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StaffDirectoryPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="general-lists" element={<GeneralListPage />} />
            <Route path="document-editor" element={<DocumentEditorPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </>
  );
}
