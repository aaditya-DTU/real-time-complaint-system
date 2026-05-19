import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";

/**
 * Modal component
 *
 * Props:
 *   open        : boolean
 *   onClose     : () => void
 *   title       : string
 *   description : string (optional subtitle)
 *   size        : "sm" | "md" | "lg" | "xl"
 *   hideClose   : boolean
 *   children    : ReactNode
 *   footer      : ReactNode (custom footer, replaces default)
 *
 * Subcomponents (named exports):
 *   ConfirmModal  — yes/no confirmation dialog
 *   AlertModal    — info/success/warning/error alert
 *   DrawerModal   — side-panel drawer variant
 */

// ── Size map ───────────────────────────────────────────────
const MAX_WIDTHS = { sm: 400, md: 520, lg: 680, xl: 860 };

// ── Core Modal ─────────────────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  description,
  size       = "md",
  hideClose  = false,
  children,
  footer,
}) {
  const overlayRef = useRef(null);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  return createPortal(
    <div
      ref={overlayRef}
      className="modal-backdrop"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="modal-box"
        style={{ maxWidth: MAX_WIDTHS[size] ?? 520 }}
      >
        {/* Header */}
        {(title || !hideClose) && (
          <div style={{
            display: "flex", alignItems: "flex-start", justifyContent: "space-between",
            padding: "1.25rem 1.5rem 0",
            gap: "1rem",
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {title && (
                <h3 id="modal-title" style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem", fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "var(--color-text-primary)",
                  margin: 0,
                }}>
                  {title}
                </h3>
              )}
              {description && (
                <p style={{
                  fontSize: "0.85rem",
                  color: "var(--color-text-secondary)",
                  marginTop: "0.25rem",
                  lineHeight: 1.5,
                }}>
                  {description}
                </p>
              )}
            </div>

            {!hideClose && (
              <button
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  width: 30, height: 30, borderRadius: "var(--radius-sm)",
                  background: "transparent",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--color-text-muted)",
                  flexShrink: 0,
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-surface-3)";
                  e.currentTarget.style.color = "var(--color-text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--color-text-muted)";
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6"  y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Divider after header */}
        {(title || !hideClose) && (
          <div style={{ height: 1, background: "var(--color-border)", margin: "1rem 0 0" }} />
        )}

        {/* Body */}
        <div style={{ padding: "1.25rem 1.5rem" }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <>
            <div style={{ height: 1, background: "var(--color-border)" }} />
            <div style={{ padding: "1rem 1.5rem" }}>
              {footer}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

// ── Confirm Modal ──────────────────────────────────────────
/**
 * Props:
 *   open, onClose, onConfirm
 *   title, message
 *   confirmLabel, cancelLabel
 *   variant: "danger" | "warning" | "primary"
 *   loading: boolean
 */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title       = "Are you sure?",
  message     = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel  = "Cancel",
  variant      = "danger",
  loading      = false,
}) {
  const iconMap = {
    danger:  { icon: "⚠️", color: "var(--color-danger)" },
    warning: { icon: "🔔", color: "var(--color-warning)" },
    primary: { icon: "ℹ️", color: "var(--color-info)" },
  };
  const { icon, color } = iconMap[variant] ?? iconMap.danger;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      hideClose={loading}
      footer={
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
        <span style={{
          fontSize: "1.5rem", flexShrink: 0,
          width: 44, height: 44,
          background: `${color}15`,
          border: `1px solid ${color}30`,
          borderRadius: "var(--radius-md)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {icon}
        </span>
        <div>
          <p style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--color-text-primary)", marginBottom: "0.35rem" }}>
            {title}
          </p>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
}

// ── Alert Modal ────────────────────────────────────────────
export function AlertModal({
  open,
  onClose,
  title,
  message,
  type    = "info",  // "success" | "warning" | "error" | "info"
  label   = "Got it",
}) {
  const cfg = {
    success: { icon: "✅", color: "var(--color-success)" },
    warning: { icon: "⚠️", color: "var(--color-warning)" },
    error:   { icon: "❌", color: "var(--color-danger)" },
    info:    { icon: "ℹ️", color: "var(--color-info)" },
  }[type] ?? { icon: "ℹ️", color: "var(--color-info)" };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="primary" onClick={onClose}>{label}</Button>
        </div>
      }
    >
      <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
        <div style={{
          width: 52, height: 52, borderRadius: "var(--radius-lg)",
          background: `${cfg.color}15`,
          border: `1px solid ${cfg.color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.6rem", margin: "0 auto 1rem",
        }}>
          {cfg.icon}
        </div>
        {title && (
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: "0.4rem" }}>
            {title}
          </h4>
        )}
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
          {message}
        </p>
      </div>
    </Modal>
  );
}

// ── Drawer Modal ───────────────────────────────────────────
/**
 * Side-panel drawer (slides in from the right).
 */
export function DrawerModal({ open, onClose, title, children, width = 440 }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", justifyContent: "flex-end",
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(3px)",
          animation: "backdrop-in 0.2s ease both",
        }}
      />

      {/* Panel */}
      <div style={{
        position: "relative", zIndex: 1,
        width, maxWidth: "100%",
        height: "100%",
        background: "var(--color-surface)",
        borderLeft: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-modal)",
        display: "flex", flexDirection: "column",
        animation: "slide-in-right 0.25s var(--ease-smooth) both",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "1rem 1.5rem",
          borderBottom: "1px solid var(--color-border)",
          flexShrink: 0,
        }}>
          <h3 style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "1.05rem", margin: 0,
          }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--color-text-muted)", padding: 4,
              borderRadius: "var(--radius-sm)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6"  y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default Modal;