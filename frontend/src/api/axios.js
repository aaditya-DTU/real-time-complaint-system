import axios from "axios";
import { APP_CONFIG, STORAGE_KEYS } from "../utils/constants";

// ── Instance ───────────────────────────────────────────────

const api = axios.create({
  baseURL:         APP_CONFIG.API_BASE_URL,
  withCredentials: false,
  timeout:         15_000,
  headers: {
    "Content-Type": "application/json",
    "Accept":       "application/json",
  },
});

// ── Request Interceptor ────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message || error.message;

    // Token expired / unauthorized → clear session and redirect
    if (status === 401) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      // Avoid redirect loop on the login page itself
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    // Forbidden
    if (status === 403) {
      console.warn("[api] Forbidden:", message);
    }

    // Network error
    if (!error.response) {
      console.error("[api] Network error — server unreachable");
    }

    // Attach a normalised error for consumers
    const enriched = new Error(message);
    enriched.status  = status;
    enriched.data    = error.response?.data;
    enriched.isAxios = true;
    return Promise.reject(enriched);
  }
);

export default api;