import { useSelector } from "react-redux";
import { useAuthContext } from "../context/AuthContext";
import {
  selectUser,
  selectToken,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectUserRole,
} from "./authSlice";
import { ROLES } from "../utils/constants";

/**
 * Primary auth hook.
 * Combines Redux state selectors + AuthContext actions into one object.
 *
 * Usage:
 *   const { user, isAuthenticated, login, logout } = useAuth();
 */
export const useAuth = () => {
  const { login, logout, refreshUser, error } = useAuthContext();

  const user            = useSelector(selectUser);
  const token           = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading         = useSelector(selectAuthLoading);
  const authError       = useSelector(selectAuthError);

  return {
    // State
    user,
    token,
    isAuthenticated,
    loading,
    error: error ?? authError,

    // Actions
    login,
    logout,
    refreshUser,
  };
};

/**
 * Returns the current user's role and convenience boolean flags.
 *
 * Usage:
 *   const { isAdmin, isStaff } = useCurrentRole();
 */
export const useCurrentRole = () => {
  const role = useSelector(selectUserRole);

  return {
    role,
    isStudent: role === ROLES.STUDENT,
    isStaff:   role === ROLES.STAFF,
    isHOD:     role === ROLES.HOD,
    isAdmin:   role === ROLES.ADMIN,
    // Elevated = can manage complaints
    isElevated: role === ROLES.STAFF || role === ROLES.HOD || role === ROLES.ADMIN,
  };
};

/**
 * Returns the current user object directly.
 */
export const useUser = () => useSelector(selectUser);

export default useAuth;