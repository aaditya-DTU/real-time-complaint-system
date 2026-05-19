/**
 * Loader components — multiple variants for different contexts.
 *
 * Exports:
 *   Spinner        — inline animated spinner
 *   PageLoader     — full-page centered loader
 *   SectionLoader  — centered loader within a section/card
 *   SkeletonLine   — single shimmer line
 *   SkeletonCard   — complaint card skeleton
 *   SkeletonTable  — table row skeletons
 *   SkeletonStats  — stat card row skeleton
 */

// ── Spinner ────────────────────────────────────────────────
export function Spinner({ size = 20, color = "var(--color-accent)" }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      style={{
        display: "inline-block",
        width: size, height: size,
        borderRadius: "50%",
        border: `2px solid var(--color-border)`,
        borderTopColor: color,
        animation: "spin 0.6s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}

// ── Page Loader ────────────────────────────────────────────
export function PageLoader({ message = "Loading…" }) {
  return (
    <div style={{
      position: "fixed", inset: 0,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: "1rem",
      background: "var(--color-bg)",
      zIndex: 9999,
    }}>
      {/* Logo mark */}
      <div style={{
        fontFamily: "var(--font-display)",
        fontSize: "1.5rem", fontWeight: 800,
        color: "var(--color-accent)",
        letterSpacing: "-0.04em",
        marginBottom: "0.5rem",
      }}>
        RTCS
      </div>

      <Spinner size={28} />

      <p style={{
        fontSize: "0.8rem",
        color: "var(--color-text-muted)",
        fontFamily: "var(--font-body)",
        letterSpacing: "0.04em",
      }}>
        {message}
      </p>
    </div>
  );
}

// ── Section Loader ─────────────────────────────────────────
export function SectionLoader({ message = "", height = 200 }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: "0.75rem",
      height, width: "100%",
    }}>
      <Spinner size={22} />
      {message && (
        <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
          {message}
        </p>
      )}
    </div>
  );
}

// ── Skeleton Primitives ────────────────────────────────────

export function SkeletonLine({ width = "100%", height = 14, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: "var(--radius-sm)", ...style }}
    />
  );
}

// ── Skeleton Card (complaint card shape) ───────────────────
export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <SkeletonLine width="60%" height={16} />
        <SkeletonLine width={60} height={22} style={{ borderRadius: 99 }} />
      </div>
      {/* Body */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <SkeletonLine width="100%" height={12} />
        <SkeletonLine width="80%"  height={12} />
      </div>
      {/* Footer row */}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
        <SkeletonLine width={80} height={22} style={{ borderRadius: 99 }} />
        <SkeletonLine width={80} height={22} style={{ borderRadius: 99 }} />
      </div>
    </div>
  );
}

// ── Skeleton Table ─────────────────────────────────────────
export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="table-wrapper">
      {/* fake header */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: "1rem",
        padding: "0.75rem 1rem",
        background: "var(--color-surface-2)",
        borderBottom: "1px solid var(--color-border)",
      }}>
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonLine key={i} height={10} width="70%" />
        ))}
      </div>
      {/* fake rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: "1rem",
          padding: "0.875rem 1rem",
          borderBottom: r < rows - 1 ? "1px solid var(--color-border-soft)" : "none",
        }}>
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonLine key={c} height={13} width={c === 0 ? "90%" : c === cols - 1 ? "50%" : "75%"} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Skeleton Stat Cards ────────────────────────────────────
export function SkeletonStats({ count = 4 }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${count}, 1fr)`,
      gap: "1rem",
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="stat-card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <SkeletonLine width="50%" height={12} />
            <SkeletonLine width={32} height={32} style={{ borderRadius: "var(--radius-md)" }} />
          </div>
          <SkeletonLine width="40%" height={28} />
          <SkeletonLine width="60%" height={10} />
        </div>
      ))}
    </div>
  );
}

// ── Skeleton Complaint Cards Grid ──────────────────────────
export function SkeletonCardGrid({ count = 6 }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
      gap: "1rem",
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ── Default export: all-purpose Loader ────────────────────
export default function Loader({ type = "spinner", ...props }) {
  if (type === "page")    return <PageLoader {...props} />;
  if (type === "section") return <SectionLoader {...props} />;
  if (type === "card")    return <SkeletonCard {...props} />;
  if (type === "table")   return <SkeletonTable {...props} />;
  if (type === "stats")   return <SkeletonStats {...props} />;
  return <Spinner {...props} />;
}