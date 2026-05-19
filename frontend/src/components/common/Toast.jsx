/**
 * Toast — lightweight in-app notification system.
 * Uses the design system CSS classes from index.css.
 *
 * Usage:
 *   import { useToast } from "./Toast";
 *   const toast = useToast();
 *   toast.success("Complaint resolved!");
 *   toast.error("SLA breached");
 *   toast.info("New assignment");
 *   toast.warning("Deadline approaching");
 *
 * Mount <ToastContainer /> once in each layout.
 */

import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

let _toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = "info", duration = 4000) => {
    const id = ++_toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
    return id;
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const api = {
    success: (msg, dur)  => add(msg, "success", dur),
    error:   (msg, dur)  => add(msg, "error",   dur),
    warning: (msg, dur)  => add(msg, "warning",  dur),
    info:    (msg, dur)  => add(msg, "info",     dur),
    dismiss: remove,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={remove} />
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
};

// ── Icons ──────────────────────────────────────────────────
const ICONS = {
  success: "✅",
  error:   "🚨",
  warning: "⚠️",
  info:    "🔔",
};

// ── Container ──────────────────────────────────────────────
function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="toast" role="region" aria-label="Notifications">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-item toast-${t.type}`}
          role="alert"
        >
          <span style={{ fontSize: "1rem", flexShrink: 0 }}>{ICONS[t.type]}</span>
          <span style={{ flex: 1, fontSize: "0.85rem", color: "var(--color-text-primary)", lineHeight: 1.4 }}>
            {t.message}
          </span>
          <button
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss"
            style={{
              background: "none", border: "none",
              cursor: "pointer", padding: 2,
              color: "var(--color-text-muted)",
              flexShrink: 0,
              lineHeight: 1,
              fontSize: "0.875rem",
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastProvider;