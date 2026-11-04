import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// Only lets signed-in users through (old app redirected to View/login.html).
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="auth-loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
