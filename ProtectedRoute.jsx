import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {
  const user = JSON.parse(localStorage.getItem("shopsphereUser"));

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== allowedRole) return <Navigate to="/" replace />;

  return children;
}