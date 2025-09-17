import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../types/auth";
import { hasPermission, getRoutePermissions } from "../../services/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Loading spinner while checking for auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  //redirect the user to login page if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const routePermissions =
    requiredRoles || getRoutePermissions(location.pathname);

  if (
    routePermissions.length > 0 &&
    !hasPermission(user.role, routePermissions)
  ) {
    //redirecting user to appropriate dashboard based on their role
    const dashboardPath =
      user.role === "admin"
        ? "/"
        : user.role === "principal"
        ? "/"
        : "/teacher-dashboard";

    return <Navigate to={dashboardPath} replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
