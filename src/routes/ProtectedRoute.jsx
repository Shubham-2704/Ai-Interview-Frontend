import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "@/context/UserContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useContext(UserContext);

  // Not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Role not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return user.role === "admin" ? (
      <Navigate to="/admin/dashboard" replace />
    ) : (
      <Navigate to="/dashboard" replace />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute
