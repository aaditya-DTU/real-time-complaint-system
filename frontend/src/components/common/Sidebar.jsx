/**
 * Sidebar — shared navigation sidebar for all role layouts.
 * Used internally by all layout files.
 *
 * Props:
 *   links   : [{ to, label, icon, end?, badge? }]
 *   role    : string
 *   open    : boolean   — mobile drawer open state
 *   onClose : fn        — close mobile drawer
 */
import { NavLink } from "react-router-dom";

const ROLE_ACCENT = {
  ADMIN:   "#ef4444",
  HOD:     "#a855f7",
  STAFF:   "#3b82f6",
  STUDENT: "#22c55e",
};

export default function Sidebar({ links = [], role, open, onClose }) {
  const accent = ROLE_ACCENT[role?.toUpperCase()] ?? "var(--color-accent)";

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(2px)",
            zIndex: 40,
            display: "block",
          }}
          className="md-hidden"
        />
      )}

      {/* Sidebar panel */}
      <aside
        style={{
          width:       240,
          minHeight:   "100vh",
          background:  "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
          display:     "flex",
          flexDirection: "column",
          flexShrink:  0,
          position:    "sticky",
          top:         0,
          height:      "100vh",
          overflowY:   "auto",
          transition:  "transform 0.25s ease",
          zIndex:      45,
        }}
      >
        {/* Logo */}
        <div style={{
          padding:      "1.1rem 1.5rem",
          borderBottom: "1px solid var(--color-border)",
          display:      "flex",
          alignItems:   "center",
          justifyContent: "space-between",
          flexShrink:   0,
        }}>
          <div>
            <span style={{
              fontFamily:    "var(--font-display)",
              fontSize:      "1.1rem",
              fontWeight:    800,
              letterSpacing: "-0.04em",
              color:         accent,
            }}>
              RTCS
            </span>
            <span style={{
              display:       "block",
              fontSize:      "0.65rem",
              fontWeight:    600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color:         "var(--color-text-muted)",
              marginTop:     "0.05rem",
            }}>
              {role ?? "Portal"}
            </span>
          </div>

          {/* Role indicator dot */}
          <span style={{
            width:        8, height: 8,
            borderRadius: "50%",
            background:   accent,
            boxShadow:    `0 0 8px ${accent}`,
            animation:    "sla-pulse 2s ease-in-out infinite",
          }} />
        </div>

        {/* Nav */}
        <nav style={{ padding: "0.75rem", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {links.map((link, i) => {
            // Section label
            if (link.section) {
              return (
                <div key={`s-${i}`} className="sidebar-section" style={{ marginTop: i > 0 ? "0.5rem" : 0 }}>
                  {link.section}
                </div>
              );
            }

            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
                onClick={onClose}
              >
                <span style={{ fontSize: "1rem", flexShrink: 0, lineHeight: 1 }}>
                  {link.icon}
                </span>
                <span style={{ flex: 1 }}>{link.label}</span>
                {link.badge != null && link.badge > 0 && (
                  <span style={{
                    fontSize:     "0.65rem",
                    fontWeight:   700,
                    padding:      "0.1rem 0.4rem",
                    borderRadius: 99,
                    background:   `${accent}20`,
                    color:        accent,
                    fontFamily:   "var(--font-mono)",
                  }}>
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom accent line */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, transparent)` }} />
      </aside>
    </>
  );
}