import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../hooks/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // localStorage side-effects live outside reducers, so we can
      // safely ignore the serializability check for the auth slice
      serializableCheck: {
        ignoredActions: ["auth/loginSuccess", "auth/logout", "auth/updateUser"],
      },
    }),
  devTools: import.meta.env.DEV,
});

// Typed helpers (optional — useful if you add TS later)
export default store;