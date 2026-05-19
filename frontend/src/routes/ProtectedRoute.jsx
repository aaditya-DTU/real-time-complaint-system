import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectAuthLoading,
} from "../hooks/authSlice";
import { PageLoader } from "../components/common/Loader";

/**
 * ProtectedRoute — blocks unauthenticated access.
 *
 * Waits for the session bootstrap to complete before
 * deciding to redirect, preventing a flash to /login on
 * page refresh while the token is being verified.
 */
const ProtectedRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading         = useSelector(selectAuthLoading);

  // Session is still being verified — show full-page loader
  if (loading) {
    return <PageLoader message="Restoring session…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;