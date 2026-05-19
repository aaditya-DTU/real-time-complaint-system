import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { loginUser, logoutUser, getMe } from "../api/auth.api";
import {
  loginSuccess,
  logout as logoutAction,
  setAuthLoading,
  setAuthError,
  updateUser,
  selectUser,
  selectToken,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from "../hooks/authSlice";

import { connectSocket, disconnectSocket, joinRoom } from "../utils/socket";

import { ROLES, STORAGE_KEYS } from "../utils/constants";

// ── Context ────────────────────────────────────────────────

const AuthContext = createContext(null);

// ── Role → route map ───────────────────────────────────────

const ROLE_HOME = {
  [ROLES.ADMIN]: "/admin",
  [ROLES.HOD]: "/manager",
  [ROLES.STAFF]: "/staff",
  [ROLES.STUDENT]: "/user",
};

// ── Provider ───────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const [bootstrapped, setBootstrapped] = useState(false);

  // ── Bootstrap: restore session on mount ─────────────────
  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!storedToken) {
        setBootstrapped(true);
        return;
      }

      try {
        dispatch(setAuthLoading(true));
        // Verify token is still valid by fetching profile
        const data = await getMe();
        dispatch(loginSuccess({ user: data.user, token: storedToken }));
        connectSocket(storedToken);
        joinRoom(data.user.role?.toLowerCase());
      } catch (err) {
        const status = err?.response?.status ?? err?.status;
        if (!status || status === 401 || status === 403) {
          dispatch(logoutAction());
        }
      } finally {
        dispatch(setAuthLoading(false));
        setBootstrapped(true);
      }
    };

    init();
  }, [dispatch]);

  // ── Login ────────────────────────────────────────────────
  const login = useCallback(
    async (credentials) => {
      dispatch(setAuthLoading(true));
      dispatch(setAuthError(null));

      try {
        const data = await loginUser(credentials);
        const { user: u, token: t } = data;

        dispatch(loginSuccess({ user: u, token: t }));

        // Socket: connect + join role room
        connectSocket(t);
        joinRoom(u.role?.toLowerCase());
        joinRoom(u._id); // personal room for targeted notifications

        // Navigate to role home
        navigate(ROLE_HOME[u.role] ?? "/user", { replace: true });
      } catch (err) {
        const msg = err?.data?.message || err?.message || "Login failed";
        dispatch(setAuthError(msg));
        throw err; // let the form surface the error too
      } finally {
        dispatch(setAuthLoading(false));
      }
    },
    [dispatch, navigate],
  );

  // ── Logout ───────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await logoutUser(); // server-side invalidation (best-effort)
    } catch {
      /* ignore */
    }

    disconnectSocket();
    dispatch(logoutAction());
    navigate("/login", { replace: true });
  }, [dispatch, navigate]);

  // ── Update Profile ───────────────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const data = await getMe();
      dispatch(updateUser(data.user));
    } catch {
      /* ignore — background refresh */
    }
  }, [dispatch]);

  // ── Context Value ────────────────────────────────────────
  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    refreshUser,
  };

  // Block rendering until session is restored
  if (!bootstrapped) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ── Consumer hook ──────────────────────────────────────────
export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuthContext must be used within <AuthProvider>");
  return ctx;
};

export default AuthContext;
