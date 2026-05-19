import { getPriorityConfig, getStatusConfig } from "../../utils/priorityColor";

/**
 * PriorityIndicator — dot + label badge for complaint priority
 *
 * Exports:
 *   PriorityIndicator  — dot + label inline
 *   PriorityBadge      — full pill badge
 *   StatusBadge        — status pill badge
 *   PriorityDot        — dot only
 *   PriorityStack      — stacked dot legend (for charts/legends)
 */

// ── Priority Dot ───────────────────────────────────────────
export function PriorityDot({ priority, size = 8 }) {
  const { hex, pulse } = getPriorityConfig(priority);
  return (
    <span
      aria-label={`Priority: ${priority}`}
      style={{
        display:       "inline-block",
        width:         size,
        height:        size,
        borderRadius:  "50%",
        background:    hex,
        flexShrink:    0,
        boxShadow:     pulse ? `0 0 ${size}px ${hex}` : "none",
        animation:     pulse ? "sla-pulse 1.5s ease-in-out infinite" : "none",
      }}
    />
  );
}

// ── Priority Indicator (dot + text) ───────────────────────
export function PriorityIndicator({ priority, showLabel = true, size = "md" }) {
  const { hex, label, pulse } = getPriorityConfig(priority);
  const dotSize = size === "sm" ? 6 : size === "lg" ? 10 : 8;
  const fontSize = size === "sm" ? "0.72rem" : size === "lg" ? "0.9rem" : "0.8rem";

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
      <span
        style={{
          width: dotSize, height: dotSize,
          borderRadius: "50%",
          background: hex,
          flexShrink: 0,
          boxShadow: pulse ? `0 0 8px ${hex}` : "none",
          animation: pulse ? "sla-pulse 1.5s ease-in-out infinite" : "none",
        }}
      />
      {showLabel && (
        <span style={{ fontSize, fontWeight: 600, color: hex, letterSpacing: "0.02em" }}>
          {label}
        </span>
      )}
    </span>
  );
}

// ── Priority Badge (pill) ──────────────────────────────────
export function PriorityBadge({ priority, size = "md" }) {
  const { hex, label, pulse } = getPriorityConfig(priority);
  const padding  = size === "sm" ? "0.15rem 0.45rem" : "0.2rem 0.6rem";
  const fontSize = size === "sm" ? "0.68rem" : "0.72rem";

  return (
    <span
      className="badge"
      style={{
        background:   `${hex}18`,
        color:         hex,
        borderColor:  `${hex}35`,
        padding,
        fontSize,
        fontWeight:   700,
        letterSpacing: "0.06em",
        animation:    pulse ? "sla-pulse 1.5s ease-in-out infinite" : "none",
      }}
    >
      <span style={{
        width: 5, height: 5, borderRadius: "50%",
        background: hex, flexShrink: 0,
        boxShadow: pulse ? `0 0 5px ${hex}` : "none",
      }} />
      {label}
    </span>
  );
}

// ── Status Badge ───────────────────────────────────────────
export function StatusBadge({ status, size = "md" }) {
  const { hex, icon } = getStatusConfig(status);
  const padding  = size === "sm" ? "0.15rem 0.45rem" : "0.2rem 0.6rem";
  const fontSize = size === "sm" ? "0.68rem" : "0.72rem";

  // Normalise label: IN_PROGRESS → In Progress
  const label = status
    ? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "—";

  return (
    <span
      className="badge"
      style={{
        background:   `${hex}18`,
        color:         hex,
        borderColor:  `${hex}35`,
        padding,
        fontSize,
        fontWeight:   700,
        letterSpacing: "0.06em",
        gap: "0.3rem",
      }}
    >
      <span style={{ fontSize: "0.75em" }}>{icon}</span>
      {label}
    </span>
  );
}

// ── Priority Stack (legend) ────────────────────────────────
export function PriorityStack({ priorities = [] }) {
  if (!priorities.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
      {priorities.map((p) => (
        <PriorityIndicator key={p} priority={p} />
      ))}
    </div>
  );
}

export default PriorityIndicator;