import { useSLA } from "../../hooks/useSLA";

const getSLAColor = (sla) => {
  if (sla.isClosed)   return "var(--color-text-muted)";  // ✅ grey when closed
  if (sla.isBreached) return "var(--color-danger)";
  if (sla.isWarning)  return "var(--color-warning)";
  return "var(--color-success)";
};

// ── Default: inline label ──────────────────────────────────
export default function SLAClock({ createdAt, type, priority, slaHours, resolved = false, closed = false }) {
  const sla   = useSLA({ createdAt, type, priority, slaHours, resolved, closed });
  const color = getSLAColor(sla);

  return (
    <span style={{
      fontFamily: "var(--font-mono)",
      fontSize:   "0.82rem",
      fontWeight: 700,
      color,
      animation:  sla.isBreached ? "sla-pulse 1.5s ease-in-out infinite" : "none",
    }}>
      {sla.label}
    </span>
  );
}

// ── SLA Badge ──────────────────────────────────────────────
export function SLABadge({ createdAt, type, priority, slaHours, resolved = false, closed = false }) {
  const sla   = useSLA({ createdAt, type, priority, slaHours, resolved, closed });
  const color = getSLAColor(sla);

  return (
    <span
      className="badge"
      style={{
        background:  `${color}15`,
        color,
        borderColor: `${color}30`,
        fontFamily:  "var(--font-mono)",
        animation:   sla.isBreached ? "sla-pulse 2s ease-in-out infinite" : "none",
      }}
    >
      {sla.isClosed ? "🔒" : sla.isBreached ? "🚨" : sla.isWarning ? "⚠️" : "✅"}
      {sla.label}
    </span>
  );
}

// ── SLA Progress Card ──────────────────────────────────────
export function SLAProgressCard({ createdAt, type, priority, slaHours, resolved = false, closed = false, title = "SLA Status" }) {
  const sla   = useSLA({ createdAt, type, priority, slaHours, resolved, closed });
  const color = getSLAColor(sla);

  return (
    <div className="card" style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          fontSize: "0.72rem", fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase",
          color: "var(--color-text-muted)",
        }}>
          {title}
        </span>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize:   "0.82rem",
          fontWeight: 700,
          color,
          // ✅ no pulse animation when closed
          animation: sla.isBreached ? "sla-pulse 1.5s ease-in-out infinite" : "none",
        }}>
          {sla.isClosed && <span style={{ marginRight: "0.35rem" }}>🔒</span>}
          {sla.label}
        </span>
      </div>

      {/* Progress bar — frozen + greyed when closed */}
      <div className="progress-bar" style={{ height: 6 }}>
        <div
          className="progress-fill"
          style={{
            width:      `${sla.percent}%`,
            background: sla.isClosed
              ? "var(--color-text-muted)"                          // ✅ grey frozen bar
              : sla.isBreached
              ? `linear-gradient(90deg, var(--color-warning), var(--color-danger))`
              : sla.isWarning
              ? `linear-gradient(90deg, var(--color-success), var(--color-warning))`
              : "var(--color-success)",
            boxShadow:  sla.isBreached ? `0 0 8px ${color}` : "none",
            transition: "width 1s ease",
            opacity:    sla.isClosed ? 0.45 : 1,                  // ✅ dimmed when closed
          }}
        />
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
          {sla.slaHours}h total window
        </span>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color }}>
          {sla.isClosed ? "Complaint closed" : `${sla.percent}% elapsed`}
        </span>
      </div>
    </div>
  );
}

// ── SLA Inline Bar ─────────────────────────────────────────
export function SLAInlineBar({ createdAt, type, priority, slaHours, resolved = false, closed = false }) {
  const sla   = useSLA({ createdAt, type, priority, slaHours, resolved, closed });
  const color = getSLAColor(sla);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: 100 }}>
      <span style={{
        fontSize: "0.72rem", fontWeight: 700,
        color, fontFamily: "var(--font-mono)",
        animation: sla.isBreached ? "sla-pulse 1.5s ease-in-out infinite" : "none",
      }}>
        {sla.isClosed ? "🔒 Closed" : sla.isBreached ? "Breached" : `${sla.percent}%`}
      </span>
      <div className="progress-bar" style={{ height: 3 }}>
        <div
          className="progress-fill"
          style={{
            width:      `${sla.percent}%`,
            background: color,
            opacity:    sla.isClosed ? 0.45 : 1,
            transition: "width 1s ease",
          }}
        />
      </div>
    </div>
  );
}