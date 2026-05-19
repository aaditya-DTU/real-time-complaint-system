import api from "./axios";

// ── Auth API ───────────────────────────────────────────────

/**
 * Login with email + password.
 * Returns { token, user }
 */
export const loginUser = async (data) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

/**
 * Register a new student account.
 * Returns { token, user }
 */
export const registerUser = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

/**
 * Fetch the currently authenticated user's profile.
 */
export const getMe = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

/**
 * Update the current user's profile (name, department, etc.)
 */
export const updateProfile = async (data) => {
  const res = await api.patch("/auth/me", data);
  return res.data;
};

/**
 * Change password.
 */
export const changePassword = async ({ currentPassword, newPassword }) => {
  const res = await api.post("/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return res.data;
};

/**
 * Logout — invalidates server-side session/token if applicable.
 */
export const logoutUser = async () => {
  try {
    await api.post("/auth/logout");
  } catch {
    // Silently ignore — client clears storage regardless
  }
};