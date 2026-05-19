import { useSelector } from "react-redux";
import { selectUser, selectUserRole } from "./authSlice";
import { ROLES, VALID_TRANSITIONS } from "../utils/constants";

/**
 * Core role hook — returns the current user's role and permission flags.
 *
 * Usage:
 *   const { role, isAdmin, can } = useRole();
 */
export const useRole = () => {
  const role = useSelector(selectUserRole);

  const is = (r) => role === r;

  // ── Permission helpers ─────────────────────────────────

  const permissions = {
    // Identity
    isStudent: is(ROLES.STUDENT),
    isStaff:   is(ROLES.STAFF),
    isHOD:     is(ROLES.HOD),
    isAdmin:   is(ROLES.ADMIN),

    // Composite
    isElevated:   role === ROLES.STAFF || role === ROLES.HOD || role === ROLES.ADMIN,
    isManagement: role === ROLES.HOD   || role === ROLES.ADMIN,

    // Feature-level permissions
    canAssignComplaints:    role === ROLES.HOD   || role === ROLES.ADMIN,
    canUpdateStatus:        role === ROLES.STAFF  || role === ROLES.HOD || role === ROLES.ADMIN,
    canViewAllComplaints:   role === ROLES.HOD    || role === ROLES.ADMIN,
    canConfigureSLA:        role === ROLES.ADMIN,
    canManageEscalations:   role === ROLES.ADMIN,
    canViewReports:         role === ROLES.HOD    || role === ROLES.ADMIN,
    canExportData:          role === ROLES.ADMIN,
    canForceClose:          role === ROLES.ADMIN,
    canSubmitComplaints:    role === ROLES.STUDENT,
  };

  /**
   * Check a single permission key.
   * @param {keyof permissions} permission
   */
  const can = (permission) => !!permissions[permission];

  /**
   * Check if the current role can transition a complaint to a new status.
   * @param {string} currentStatus
   * @param {string} newStatus
   */
  const canTransition = (currentStatus, newStatus) => {
    if (!permissions.canUpdateStatus) return false;
    const allowed = VALID_TRANSITIONS[currentStatus] ?? [];
    return allowed.includes(newStatus);
  };

  /**
   * Get the list of allowed next statuses for the current role + status.
   */
  const getAllowedTransitions = (currentStatus) => {
    if (!permissions.canUpdateStatus) return [];
    return VALID_TRANSITIONS[currentStatus] ?? [];
  };

  /**
   * Route the user should land on after login.
   */
  const homeRoute = {
    [ROLES.STUDENT]: "/user",
    [ROLES.STAFF]:   "/staff",
    [ROLES.HOD]:     "/manager",
    [ROLES.ADMIN]:   "/admin",
  }[role] ?? "/login";

  return {
    role,
    ...permissions,
    can,
    canTransition,
    getAllowedTransitions,
    homeRoute,
  };
};

/**
 * Guard hook — returns whether the user has ANY of the provided roles.
 *
 * Usage:
 *   const allowed = useHasRole([ROLES.ADMIN, ROLES.HOD]);
 */
export const useHasRole = (allowedRoles = []) => {
  const role = useSelector(selectUserRole);
  return allowedRoles.includes(role);
};

/**
 * Returns the full current user object alongside role flags.
 */
export const useUserWithRole = () => {
  const user = useSelector(selectUser);
  const role = useSelector(selectUserRole);

  return {
    user,
    role,
    displayName: user?.name ?? "User",
    department:  user?.department ?? null,
    avatar:      user?.avatar ?? null,
    initials:    user?.name
      ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
      : "?",
  };
};

export default useRole;