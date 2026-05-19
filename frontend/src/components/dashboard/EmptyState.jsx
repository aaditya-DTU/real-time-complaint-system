/**
 * EmptyState — contextual empty/zero-data states
 *
 * Props:
 *   icon        : string | ReactNode
 *   title       : string
 *   message     : string
 *   action      : { label, onClick }  — optional CTA button
 *   compact     : boolean
 *   variant     : "default" | "error" | "search" | "filtered"
 *
 * Named exports:
 *   NoComplaints, NoResults, ErrorState, LoadFailed
 */

import Button from "../common/Button";

// ── Core EmptyState ────────────────────────────────────────
export default function EmptyState({
  icon    = "📭",
  title   = "Nothing here",
  message = "",
  action,
  compact = false,
  variant = "default",
}) {
  const variantStyle = {
    error:    { iconBg: "var(--color-danger-dim)",  iconBorder: "rgba(239,68,68,0.2)" },
    search:   { iconBg: "var(--color-surface-2)",   iconBorder: "var(--color-border)" },
    filtered: { iconBg: "var(--color-warning-dim)", iconBorder: "rgba(245,158,11,0.2)" },
    default:  { iconBg: "var(--color-surface-2)",   iconBorder: "var(--color-border)" },
  }[variant] ?? {};

  return (
    <div
      className="empty-state"
      style={{ padding: compact ? "2rem 1rem" : "4rem 2rem" }}
    >
      {/* Icon box */}
      <div style={{
        width:        compact ? 44 : 56,
        height:       compact ? 44 : 56,
        borderRadius: "var(--radius-lg)",
        background:   variantStyle.iconBg,
        border:       `1px solid ${variantStyle.iconBorder}`,
        display:      "flex",
        alignItems:   "center",
        justifyContent: "center",
        fontSize:     compact ? "1.25rem" : "1.6rem",
      }}>
        {icon}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", alignItems: "center" }}>
        <h4 style={{
          fontFamily:    "var(--font-display)",
          fontSize:      compact ? "0.95rem" : "1.1rem",
          fontWeight:    700,
          color:         "var(--color-text-primary)",
          margin:        0,
          letterSpacing: "-0.02em",
        }}>
          {title}
        </h4>

        {message && (
          <p style={{
            fontSize:   compact ? "0.8rem" : "0.875rem",
            color:      "var(--color-text-muted)",
            maxWidth:   360,
            textAlign:  "center",
            lineHeight: 1.55,
          }}>
            {message}
          </p>
        )}
      </div>

      {action && (
        <Button
          variant="primary"
          size={compact ? "sm" : "md"}
          onClick={action.onClick}
          icon={action.icon}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

// ── Preset variants ────────────────────────────────────────

export function NoComplaints({ onSubmit }) {
  return (
    <EmptyState
      icon="📋"
      title="No complaints yet"
      message="You haven't submitted any complaints. Create one and we'll track it in real time."
      action={onSubmit ? { label: "Submit a Complaint", onClick: onSubmit } : undefined}
    />
  );
}

export function NoAssignedComplaints() {
  return (
    <EmptyState
      icon="✅"
      title="All clear!"
      message="You have no assigned complaints at the moment. Check back later."
    />
  );
}

export function NoResults({ query, onClear }) {
  return (
    <EmptyState
      icon="🔍"
      variant="search"
      title="No results found"
      message={query ? `Nothing matched "${query}". Try different keywords or remove filters.` : "No items match your current filters."}
      action={onClear ? { label: "Clear filters", onClick: onClear } : undefined}
    />
  );
}

export function NoEscalations() {
  return (
    <EmptyState
      icon="🎯"
      title="No escalations"
      message="All complaints are within SLA. Great work keeping up!"
    />
  );
}

export function NoBreaches() {
  return (
    <EmptyState
      icon="🏆"
      title="Zero SLA breaches"
      message="All active complaints are within their deadlines."
    />
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <EmptyState
      icon="⚠️"
      variant="error"
      title="Something went wrong"
      message={message || "We couldn't load this data. Please try again."}
      action={onRetry ? { label: "Try again", onClick: onRetry } : undefined}
    />
  );
}

export function LoadFailed({ onRetry }) {
  return (
    <EmptyState
      icon="🔌"
      variant="error"
      title="Failed to load"
      message="There was a problem connecting to the server."
      action={onRetry ? { label: "Retry", onClick: onRetry } : undefined}
    />
  );
}