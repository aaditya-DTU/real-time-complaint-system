/**
 * Section — page section wrapper with header, actions, and content area.
 *
 * Props:
 *   title       : string
 *   subtitle    : string
 *   icon        : string | ReactNode
 *   actions     : ReactNode       — right-side action buttons
 *   children    : ReactNode
 *   loading     : boolean         — show skeleton instead of children
 *   skeletonType: "table"|"cards"|"stats"
 *   noPadding   : boolean
 *   accent      : string          — left border accent color
 *   collapsible : boolean
 *   defaultOpen : boolean
 *   badge       : string | number — header badge count
 *
 * Named exports:
 *   SectionHeader  — header only (for custom layouts)
 *   FilterBar      — reusable search + filter row
 *   PageSection    — full-page-width section (no card)
 */

import { useState } from "react";
import { SkeletonTable, SkeletonCardGrid, SkeletonStats } from "../common/Loader";

// ── Section ────────────────────────────────────────────────
export default function Section({
  title,
  subtitle,
  icon,
  actions,
  children,
  loading       = false,
  skeletonType  = "table",
  noPadding     = false,
  accent,
  collapsible   = false,
  defaultOpen   = true,
  badge,
}) {
  const [open, setOpen] = useState(defaultOpen);

  const skeleton = {
    table: <SkeletonTable rows={5} />,
    cards: <SkeletonCardGrid count={6} />,
    stats: <SkeletonStats count={4} />,
  }[skeletonType];

  return (
    <div
      className="card"
      style={{
        padding:    0,
        overflow:   "hidden",
        borderLeft: accent ? `3px solid ${accent}` : undefined,
      }}
    >
      {/* Header */}
      {(title || actions) && (
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "1rem 1.25rem",
          borderBottom:   open ? "1px solid var(--color-border)" : "none",
          gap:            "1rem",
          flexWrap:       "wrap",
        }}>
          {/* Left */}
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.625rem", cursor: collapsible ? "pointer" : "default" }}
            onClick={collapsible ? () => setOpen((p) => !p) : undefined}
          >
            {icon && (
              <span style={{
                width: 30, height: 30,
                borderRadius: "var(--radius-sm)",
                background: "var(--color-surface-3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.875rem", flexShrink: 0,
              }}>
                {icon}
              </span>
            )}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {title && (
                  <h3 style={{
                    fontFamily:    "var(--font-display)",
                    fontSize:      "0.95rem",
                    fontWeight:    700,
                    letterSpacing: "-0.02em",
                    color:         "var(--color-text-primary)",
                    margin:        0,
                  }}>
                    {title}
                  </h3>
                )}
                {badge != null && (
                  <span style={{
                    fontSize: "0.7rem", fontWeight: 700,
                    padding: "0.1rem 0.45rem",
                    borderRadius: 99,
                    background: "var(--color-surface-3)",
                    color: "var(--color-text-secondary)",
                    fontFamily: "var(--font-mono)",
                  }}>
                    {badge}
                  </span>
                )}
                {collapsible && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="var(--color-text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                )}
              </div>
              {subtitle && (
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", margin: 0, marginTop: "0.1rem" }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right actions */}
          {actions && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Body */}
      {open && (
        <div style={noPadding ? {} : { padding: "1.25rem" }}>
          {loading ? skeleton : children}
        </div>
      )}
    </div>
  );
}

// ── SectionHeader (standalone) ─────────────────────────────
export function SectionHeader({ title, subtitle, actions, icon }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
        {icon && (
          <span style={{ fontSize: "1.25rem", flexShrink: 0, marginTop: 2 }}>{icon}</span>
        )}
        <div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.25rem", fontWeight: 800,
            letterSpacing: "-0.03em", margin: 0,
            color: "var(--color-text-primary)",
          }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0.25rem 0 0" }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </div>
  );
}

// ── FilterBar ──────────────────────────────────────────────
export function FilterBar({
  search,
  onSearch,
  filters    = [],   // [{ key, label, options: [{value, label}] }]
  values     = {},   // { [key]: selectedValue }
  onChange,          // (key, value) => void
  onClear,
  placeholder = "Search complaints…",
}) {
  const hasActive = Object.values(values).some(Boolean);

  return (
    <div style={{
      display:   "flex",
      gap:       "0.625rem",
      flexWrap:  "wrap",
      alignItems: "center",
    }}>
      {/* Search */}
      <div style={{ position: "relative", flex: "1 1 200px", minWidth: 180 }}>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ position: "absolute", left: "0.7rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
        >
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          value={search ?? ""}
          onChange={(e) => onSearch?.(e.target.value)}
          placeholder={placeholder}
          style={{ paddingLeft: "2.2rem", fontSize: "0.875rem" }}
        />
      </div>

      {/* Dropdowns */}
      {filters.map((f) => (
        <select
          key={f.key}
          value={values[f.key] ?? ""}
          onChange={(e) => onChange?.(f.key, e.target.value)}
          style={{ flex: "0 0 auto", fontSize: "0.875rem", minWidth: 130 }}
        >
          <option value="">{f.label}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ))}

      {/* Clear */}
      {hasActive && onClear && (
        <button
          onClick={onClear}
          className="btn btn-ghost btn-sm"
          style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}
        >
          ✕ Clear
        </button>
      )}
    </div>
  );
}

// ── PageSection (no card wrapper) ─────────────────────────
export function PageSection({ title, subtitle, actions, children, icon }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <SectionHeader title={title} subtitle={subtitle} actions={actions} icon={icon} />
      {children}
    </section>
  );
}