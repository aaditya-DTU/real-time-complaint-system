import { useNavigate } from "react-router-dom";
import { useRole } from "../hooks/useRole";

/**
 * 404 Not Found page
 */
export default function NotFound() {
  const navigate = useNavigate();
  const { homeRoute, role } = useRole();

  return (
    <div style={{
      minHeight:      "100vh",
      background:     "var(--color-bg)",
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      gap:            "1.5rem",
      textAlign:      "center",
      padding:        "2rem",
    }}>
      {/* Large 404 */}
      <div style={{
        fontFamily:    "var(--font-display)",
        fontSize:      "clamp(5rem, 15vw, 9rem)",
        fontWeight:    800,
        letterSpacing: "-0.06em",
        lineHeight:    1,
        color:         "var(--color-surface-3)",
        userSelect:    "none",
      }}>
        404
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
        <h2 style={{
          fontFamily:    "var(--font-display)",
          fontWeight:    800,
          fontSize:      "1.4rem",
          letterSpacing: "-0.03em",
          margin:        0,
          color:         "var(--color-text-primary)",
        }}>
          Page not found
        </h2>
        <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", maxWidth: 360 }}>
          The page you're looking for doesn't exist or you don't have access to it.
        </p>
      </div>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
        >
          ← Go back
        </button>
        <button
          onClick={() => navigate(role ? homeRoute : "/")}
          className="btn btn-primary"
        >
          {role ? "Dashboard" : "Home"}
        </button>
      </div>
    </div>
  );
}