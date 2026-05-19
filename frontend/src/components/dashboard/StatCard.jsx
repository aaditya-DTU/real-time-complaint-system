/**
 * StatCard — dashboard metric card
 *
 * Props:
 *   title       : string
 *   value       : string | number
 *   subtitle    : string          — secondary line below value
 *   icon        : string | ReactNode
 *   accent      : string          — CSS color for top strip + icon bg
 *   trend       : number          — % change (positive = up, negative = down)
 *   trendLabel  : string          — e.g. "vs last week"
 *   loading     : boolean
 *   onClick     : fn
 *
 * Named exports:
 *   MiniStat    — compact inline metric (no card)
 *   StatRow     — horizontal row of stats
 */

// ── StatCard ───────────────────────────────────────────────
export default function StatCard({
  title      = "",
  value      = "—",
  subtitle,
  icon,
  accent     = "var(--color-accent)",
  trend,
  trendLabel = "vs last period",
  loading    = false,
  onClick,
}) {
  const clickable = !!onClick;

  if (loading) {
    return (
      <div className="stat-card" style={{ "--accent-color": accent, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div className="skeleton" style={{ height: 12, width: "50%" }} />
          <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "var(--radius-md)" }} />
        </div>
        <div className="skeleton" style={{ height: 28, width: "40%" }} />
        <div className="skeleton" style={{ height: 10, width: "60%" }} />
      </div>
    );
  }

  const trendUp      = trend > 0;
  const trendDown    = trend < 0;
  const trendColor   = trendUp ? "var(--color-success)" : trendDown ? "var(--color-danger)" : "var(--color-text-muted)";
  const trendIcon    = trendUp ? "↑" : trendDown ? "↓" : "→";

  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{
        "--accent-color": accent,
        cursor:  clickable ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        gap: "0.625rem",
      }}
    >
      {/* Header: label + icon */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{
          fontSize:      "0.72rem",
          fontWeight:    700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color:         "var(--color-text-muted)",
        }}>
          {title}
        </span>

        {icon && (
          <div style={{
            width:        36, height: 36,
            borderRadius: "var(--radius-md)",
            background:   `${accent}18`,
            border:       `1px solid ${accent}30`,
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
            fontSize:     "1rem",
            flexShrink:   0,
          }}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
        <span style={{
          fontFamily:    "var(--font-display)",
          fontSize:      "clamp(1.5rem, 3vw, 2rem)",
          fontWeight:    800,
          letterSpacing: "-0.03em",
          color:         "var(--color-text-primary)",
          lineHeight:    1,
        }}>
          {value}
        </span>
      </div>

      {/* Subtitle */}
      {subtitle && (
        <span style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)" }}>
          {subtitle}
        </span>
      )}

      {/* Trend */}
      {trend != null && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "auto" }}>
          <span style={{
            fontSize:  "0.75rem",
            fontWeight: 700,
            color:     trendColor,
            fontFamily: "var(--font-mono)",
          }}>
            {trendIcon} {Math.abs(trend)}%
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
            {trendLabel}
          </span>
        </div>
      )}
    </div>
  );
}

// ── MiniStat ───────────────────────────────────────────────
export function MiniStat({ label, value, accent = "var(--color-accent)" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
      <span style={{
        fontSize: "0.68rem", fontWeight: 700,
        letterSpacing: "0.08em", textTransform: "uppercase",
        color: "var(--color-text-muted)",
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: "var(--font-display)",
        fontSize: "1.25rem", fontWeight: 800,
        letterSpacing: "-0.03em",
        color: accent,
      }}>
        {value}
      </span>
    </div>
  );
}

// ── StatRow ────────────────────────────────────────────────
export function StatRow({ stats = [] }) {
  return (
    <div style={{
      display: "flex",
      gap: "0",
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          flex: 1,
          padding: "1rem 1.25rem",
          borderRight: i < stats.length - 1 ? "1px solid var(--color-border)" : "none",
          display: "flex", flexDirection: "column", gap: "0.3rem",
        }}>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
            {s.label}
          </span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-0.03em", color: s.color ?? "var(--color-text-primary)" }}>
            {s.value}
          </span>
          {s.sub && (
            <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>{s.sub}</span>
          )}
        </div>
      ))}
    </div>
  );
}