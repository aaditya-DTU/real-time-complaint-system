import { Outlet } from "react-router-dom";

/**
 * AuthLayout — wrapper for Login / Register / Landing pages.
 * Full-screen dark background with centered card and RTCS branding.
 */
export default function AuthLayout({ children }) {
  return (
    <div style={{
      minHeight:       "100vh",
      background:      "var(--color-bg)",
      display:         "flex",
      flexDirection:   "column",
      alignItems:      "center",
      justifyContent:  "center",
      padding:         "1.5rem",
      backgroundImage: [
        "radial-gradient(ellipse 60% 40% at 20% 20%, rgba(245,158,11,0.06) 0%, transparent 60%)",
        "radial-gradient(ellipse 60% 40% at 80% 80%, rgba(59,130,246,0.05) 0%, transparent 60%)",
      ].join(", "),
    }}>

      {/* Brand mark */}
      <div style={{
        display:       "flex",
        flexDirection: "column",
        alignItems:    "center",
        gap:           "0.25rem",
        marginBottom:  "2rem",
      }}>
        <span style={{
          fontFamily:    "var(--font-display)",
          fontSize:      "2rem",
          fontWeight:    800,
          letterSpacing: "-0.05em",
          color:         "var(--color-accent)",
          lineHeight:    1,
        }}>
          RTCS
        </span>
        <span style={{
          fontSize:      "0.7rem",
          fontWeight:    600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color:         "var(--color-text-muted)",
        }}>
          Real-Time Complaint Escalation
        </span>
      </div>

      {/* Card */}
      <div style={{
        width:        "100%",
        maxWidth:     440,
        background:   "var(--color-surface)",
        border:       "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        boxShadow:    "var(--shadow-modal)",
        overflow:     "hidden",
      }}>
        {/* Top accent bar */}
        <div style={{
          height:     3,
          background: "linear-gradient(90deg, var(--color-accent), #f97316, transparent)",
        }} />

        <div style={{ padding: "2rem" }}>
          {/* Render children (for component usage) OR outlet (for route usage) */}
          {children ?? <Outlet />}
        </div>
      </div>

      {/* Footer */}
      <p style={{
        marginTop:  "1.5rem",
        fontSize:   "0.72rem",
        color:      "var(--color-text-muted)",
        textAlign:  "center",
      }}>
        Automated escalation · Real-time notifications · SLA enforcement
      </p>
    </div>
  );
}