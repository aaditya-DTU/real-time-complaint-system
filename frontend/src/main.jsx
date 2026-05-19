import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";

/**
 * main.jsx — application entry point.
 *
 * Responsibilities:
 *   - Mount the React app
 *   - Import global styles
 *
 * NOT responsible for:
 *   - Redux store setup     → App.jsx (Provider)
 *   - Router setup          → App.jsx (BrowserRouter)
 *   - Auth / socket setup   → AuthContext (bootstraps on mount)
 *   - Toast notifications   → each Layout (ToastProvider)
 *
 * Note: socket connection is handled inside AuthContext.login()
 * and the session bootstrap — never connect unconditionally here
 * as the token might not exist yet.
 */

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);