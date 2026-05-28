import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, allowRoles = [] }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowRoles.length > 0 && !allowRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
