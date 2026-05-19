import { createSlice } from "@reduxjs/toolkit";
import { STORAGE_KEYS } from "../utils/constants";

// ── Helpers ────────────────────────────────────────────────

const loadFromStorage = () => {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const user  = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || "null");
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

const persist = (token, user) => {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

const clear = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// ── Initial State ──────────────────────────────────────────

const { token, user } = loadFromStorage();

const initialState = {
  user,
  token,
  isAuthenticated: !!token,
  loading:         false,
  error:           null,
};

// ── Slice ──────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Called after successful login/register API response
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.user            = user;
      state.token           = token;
      state.isAuthenticated = true;
      state.error           = null;
      state.loading         = false;
      persist(token, user);
    },

    // Optimistically update user profile in store + storage
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      if (state.token) {
        persist(state.token, state.user);
      }
    },

    // Set loading flag while async login is in-flight
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Store auth error message
    setAuthError: (state, action) => {
      state.error   = action.payload;
      state.loading = false;
    },

    clearAuthError: (state) => {
      state.error = null;
    },

    // Full logout — clears state + storage
    logout: (state) => {
      state.user            = null;
      state.token           = null;
      state.isAuthenticated = false;
      state.loading         = false;
      state.error           = null;
      clear();
    },
  },
});

export const {
  loginSuccess,
  updateUser,
  setAuthLoading,
  setAuthError,
  clearAuthError,
  logout,
} = authSlice.actions;

// ── Selectors ──────────────────────────────────────────────
export const selectUser            = (state) => state.auth.user;
export const selectToken           = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading     = (state) => state.auth.loading;
export const selectAuthError       = (state) => state.auth.error;
export const selectUserRole        = (state) => state.auth.user?.role;

export default authSlice.reducer;