import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import type { UserRoleName } from "@/types/auth";

interface ProtectedRouteProps {
  allowedRoles?: UserRoleName[];
}

/**
 * Guards nested routes: redirects to /login if not authenticated,
 * and to the homepage if authenticated but the wrong role (e.g. a
 * Customer trying to reach an Artisan-only route).
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return null; // could swap for a full-page spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
