import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUserWithRole } from "../../hooks/useRole";
import { useAuthContext } from "../../context/AuthContext";
import { onNotification, onComplaintEscalated, onSLABreached } from "../../utils/socket";
import { timeAgoShort } from "../../utils/formatDate";
import { ROLES } from "../../utils/constants";

// ── Notification Bell ──────────────────────────────────────
function NotificationBell({ notifications, onClear }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const unread = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="btn btn-ghost btn-sm"
        style={{ position: "relative", width: 36, height: 36, padding: 0, justifyContent: "center" }}
        aria-label="Notifications"
      >
        {/* Bell icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span style={{
            position: "absolute", top: 4, right: 4,
            width: 8, height: 8, borderRadius: "50%",
            background: "var(--color-danger)",
            border: "2px solid var(--color-surface)",
          }} />
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          width: 320, background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-modal)",
          zIndex: 100,
          overflow: "hidden",
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0.75rem 1rem",
            borderBottom: "1px solid var(--color-border)",
          }}>
            <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>Notifications</span>
            {unread > 0 && (
              <button
                onClick={onClear}
                style={{ fontSize: "0.75rem", color: "var(--color-accent)", background: "none", border: "none", cursor: "pointer" }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                All caught up 🎉
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div key={n.id} style={{
                  padding: "0.75rem 1rem",
                  borderBottom: "1px solid var(--color-border-soft)",
                  background: n.read ? "transparent" : "var(--color-accent-glow)",
                  display: "flex", gap: "0.75rem", alignItems: "flex-start",
                }}>
                  <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: 2 }}>{n.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-text-primary)", marginBottom: "0.1rem", lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
                      {timeAgoShort(n.time)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── User Menu ──────────────────────────────────────────────
function UserMenu({ user, role, initials, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const roleColor = {
    [ROLES.ADMIN]:   "var(--color-danger)",
    [ROLES.HOD]:     "#a855f7",
    [ROLES.STAFF]:   "var(--color-info)",
    [ROLES.STUDENT]: "var(--color-success)",
  }[role] ?? "var(--color-accent)";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="btn btn-ghost btn-sm"
        style={{ gap: "0.625rem", padding: "0.35rem 0.5rem" }}
      >
        {/* Avatar */}
        <span style={{
          width: 30, height: 30, borderRadius: "50%",
          background: `${roleColor}20`,
          border: `1.5px solid ${roleColor}50`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: "0.7rem", color: roleColor, flexShrink: 0,
        }}>
          {initials}
        </span>

        <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-primary)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user?.name}
        </span>

        {/* Role badge */}
        <span className="badge" style={{ background: `${roleColor}18`, color: roleColor, borderColor: `${roleColor}30`, fontSize: "0.65rem" }}>
          {role}
        </span>

        {/* Chevron */}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ color: "var(--color-text-muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          width: 200, background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-card)",
          zIndex: 100, overflow: "hidden",
          animation: "fade-in 0.15s ease both",
        }}>
          {/* User info */}
          <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--color-border)" }}>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.1rem" }}>{user?.name}</p>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{user?.email}</p>
          </div>

          {/* Menu items */}
          <div style={{ padding: "0.375rem" }}>
            <Link
              to={`/${role?.toLowerCase() === "student" ? "user" : role?.toLowerCase()}`}
              onClick={() => setOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.5rem 0.625rem", borderRadius: "var(--radius-sm)",
                fontSize: "0.875rem", color: "var(--color-text-secondary)",
                textDecoration: "none", transition: "all 0.15s",
              }}
              className="sidebar-link"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Dashboard
            </Link>

            <button
              onClick={() => { onLogout(); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem", width: "100%",
                padding: "0.5rem 0.625rem", borderRadius: "var(--radius-sm)",
                fontSize: "0.875rem", color: "var(--color-danger)",
                background: "none", border: "none", cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-danger-dim)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "none"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Header ─────────────────────────────────────────────────
export default function Header() {
  const { logout }             = useAuthContext();
  const { user, role, initials } = useUserWithRole();
  const location               = useLocation();
  const [notifications, setNotifications] = useState([]);

  // Subscribe to real-time notifications
  useEffect(() => {
    const addNotif = (msg, icon = "🔔") => {
      setNotifications((prev) => [
        { id: Date.now(), message: msg, icon, time: new Date(), read: false },
        ...prev.slice(0, 19),
      ]);
    };

    const unsub1 = onNotification((n)         => addNotif(n.message || String(n), "🔔"));
    const unsub2 = onComplaintEscalated((c)   => addNotif(`Complaint #${c._id?.slice(-6)} escalated`, "🚨"));
    const unsub3 = onSLABreached((c)          => addNotif(`SLA breached: ${c.title || c._id?.slice(-6)}`, "⏰"));

    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  const clearNotifications = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  // Derive page title from pathname
  const pageTitle = (() => {
    const p = location.pathname;
    if (p.includes("dashboard"))  return "Dashboard";
    if (p.includes("complaints")) return "Complaints";
    if (p.includes("escalat"))    return "Escalations";
    if (p.includes("reports"))    return "Reports";
    if (p.includes("sla"))        return "SLA Config";
    if (p.includes("metrics"))    return "Metrics";
    if (p.includes("staff"))      return "Staff";
    return "RTCS";
  })();

  return (
    <header style={{
      height: 56,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 1.5rem",
      background: "var(--color-surface)",
      borderBottom: "1px solid var(--color-border)",
      position: "sticky", top: 0, zIndex: 40,
      flexShrink: 0,
    }}>
      {/* Left — page title */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "1rem", fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "var(--color-text-primary)",
          margin: 0,
        }}>
          {pageTitle}
        </h2>

        {/* Live indicator dot */}
        <span style={{
          display: "flex", alignItems: "center", gap: "0.3rem",
          fontSize: "0.7rem", color: "var(--color-text-muted)",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--color-success)",
            boxShadow: "0 0 6px var(--color-success)",
            animation: "sla-pulse 2s ease-in-out infinite",
          }} />
          Live
        </span>
      </div>

      {/* Right — actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <NotificationBell notifications={notifications} onClear={clearNotifications} />
        <UserMenu user={user} role={role} initials={initials} onLogout={logout} />
      </div>
    </header>
  );
}