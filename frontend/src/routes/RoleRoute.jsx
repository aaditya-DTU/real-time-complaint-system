import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser, selectUserRole } from "../hooks/authSlice";
import { ROLES } from "../utils/constants";

/**
 * RoleRoute — restricts a subtree to one or more allowed roles.
 *
 * Props:
 *   role  : string | string[]  — allowed role(s)
 *
 * Redirect logic:
 *   - Wrong role → redirect to that user's own home (not /login)
 *   - No user    → redirect to /login (shouldn't happen inside ProtectedRoute)
 */

const ROLE_HOME = {
  [ROLES.STUDENT]: "/user",
  [ROLES.STAFF]:   "/staff",
  [ROLES.HOD]:     "/manager",
  [ROLES.ADMIN]:   "/admin",
};

const RoleRoute = ({ role }) => {
  const user      = useSelector(selectUser);
  const userRole  = useSelector(selectUserRole);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allowed = Array.isArray(role)
    ? role.map((r) => r.toUpperCase())
    : [role.toUpperCase()];

  if (!allowed.includes(userRole?.toUpperCase())) {
    // Redirect to the user's own home instead of /login
    const home = ROLE_HOME[userRole] ?? "/login";
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;