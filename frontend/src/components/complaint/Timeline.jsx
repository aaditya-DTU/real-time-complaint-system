import { getStatusConfig } from "../../utils/priorityColor";
import { formatDateTime, timeAgo } from "../../utils/formatDate";

/**
 * Timeline — complaint audit trail / status history
 *
 * Exports:
 *   Timeline         — full audit log timeline
 *   StatusTimeline   — simplified status-change-only view
 *   TimelineItem     — single item (composable)
 */

// ── Icon map for actions ───────────────────────────────────
const ACTION_ICON = {
  CREATED:     { icon: "📝", color: "var(--color-info)" },
  SUBMITTED:   { icon: "📤", color: "var(--color-info)" },
  ASSIGNED:    { icon: "👤", color: "#a855f7" },
  IN_PROGRESS: { icon: "🔄", color: "var(--color-warning)" },
  RESOLVED:    { icon: "✅", color: "var(--color-success)" },
  CLOSED:      { icon: "🔒", color: "#64748b" },
  ESCALATED:   { icon: "🚨", color: "var(--color-danger)" },
  REMARK:      { icon: "💬", color: "var(--color-info)" },
  SLA_BREACH:  { icon: "⏰", color: "var(--color-danger)" },
  SYSTEM:      { icon: "⚙️", color: "var(--color-text-muted)" },
};

const getActionConfig = (action) =>
  ACTION_ICON[action?.toUpperCase()] ?? ACTION_ICON.SYSTEM;

// ── Timeline Item ──────────────────────────────────────────
export function TimelineItem({ entry, isLast = false }) {
  const {
    action,
    message,
    performedBy,
    timestamp,
    meta = {},
  } = entry;

  const { icon, color } = getActionConfig(action);
  const isSystem = !performedBy || performedBy === "SYSTEM";

  return (
    <div className="timeline-item">
      {/* Spine */}
      <div className="timeline-spine">
        <div style={{
          width: 30, height: 30,
          borderRadius: "50%",
          background: `${color}18`,
          border: `1.5px solid ${color}35`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.85rem",
          flexShrink: 0,
          zIndex: 1,
        }}>
          {icon}
        </div>
        {!isLast && (
          <div style={{
            flex: 1, width: 1,
            background: "var(--color-border)",
            marginTop: 4,
          }} />
        )}
      </div>

      {/* Content */}
      <div className="timeline-content">
        {/* Action label + time */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.2rem" }}>
          <span style={{
            fontSize: "0.82rem", fontWeight: 700,
            color, letterSpacing: "0.02em",
          }}>
            {action?.replace(/_/g, " ")}
          </span>
          <span style={{
            fontSize: "0.72rem",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
            flexShrink: 0,
          }}>
            {timestamp ? timeAgo(timestamp) : ""}
          </span>
        </div>

        {/* Message */}
        {message && (
          <p style={{
            fontSize: "0.85rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.5,
            margin: "0.2rem 0",
          }}>
            {message}
          </p>
        )}

        {/* Remarks */}
        {meta.remarks && (
          <div style={{
            marginTop: "0.4rem",
            padding: "0.5rem 0.75rem",
            background: "var(--color-surface-2)",
            borderLeft: `2px solid ${color}`,
            borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
          }}>
            <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", fontStyle: "italic", margin: 0 }}>
              "{meta.remarks}"
            </p>
          </div>
        )}

        {/* Status change */}
        {meta.from && meta.to && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.35rem" }}>
            <StatusChip status={meta.from} />
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
            <StatusChip status={meta.to} />
          </div>
        )}

        {/* Actor */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.35rem" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
            {isSystem ? "⚙️ System" : `👤 ${performedBy?.name ?? performedBy}`}
          </span>
          {timestamp && (
            <>
              <span style={{ color: "var(--color-text-muted)", fontSize: "0.65rem" }}>·</span>
              <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                {formatDateTime(timestamp)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Mini status chip (used inside timeline) ────────────────
function StatusChip({ status }) {
  const { hex } = getStatusConfig(status);
  const label = status?.replace(/_/g, " ") ?? "—";
  return (
    <span style={{
      fontSize: "0.68rem", fontWeight: 700,
      padding: "0.15rem 0.45rem",
      borderRadius: 99,
      background: `${hex}18`,
      color: hex,
      border: `1px solid ${hex}30`,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
    }}>
      {label}
    </span>
  );
}

// ── Full Timeline ──────────────────────────────────────────
export function Timeline({ entries = [], loading = false, emptyMessage = "No activity yet" }) {
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: "flex", gap: "1rem" }}>
            <div className="skeleton" style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <div className="skeleton" style={{ height: 12, width: "40%" }} />
              <div className="skeleton" style={{ height: 10, width: "70%" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!entries.length) {
    return (
      <div className="empty-state" style={{ padding: "2.5rem 1rem" }}>
        <div className="empty-icon">📋</div>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="timeline">
      {entries.map((entry, idx) => (
        <TimelineItem
          key={entry._id ?? idx}
          entry={entry}
          isLast={idx === entries.length - 1}
        />
      ))}
    </div>
  );
}

// ── Status Timeline ────────────────────────────────────────
/**
 * Visual status progress bar showing the complaint's journey.
 * Highlights current step and marks completed ones.
 */
const STATUS_STEPS = [
  "SUBMITTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED",
];

export function StatusTimeline({ currentStatus, escalated = false }) {
  const steps = escalated
    ? ["SUBMITTED", "ASSIGNED", "ESCALATED", "IN_PROGRESS", "RESOLVED", "CLOSED"]
    : STATUS_STEPS;

  const currentIdx = steps.indexOf(currentStatus);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, width: "100%", overflowX: "auto", paddingBottom: "0.25rem" }}>
      {steps.map((step, idx) => {
        const done    = idx < currentIdx;
        const active  = idx === currentIdx;
        const { hex } = getStatusConfig(step);

        return (
          <div key={step} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
            {/* Node */}
            <div style={{
              display:        "flex",
              flexDirection:  "column",
              alignItems:     "center",
              gap:            "0.35rem",
              flex:           "0 0 auto",
            }}>
              <div style={{
                width:        active ? 14 : 10,
                height:       active ? 14 : 10,
                borderRadius: "50%",
                background:   done || active ? hex : "var(--color-surface-3)",
                border:       active ? `2px solid var(--color-bg)` : "none",
                boxShadow:    active ? `0 0 0 2px ${hex}, 0 0 10px ${hex}60` : "none",
                transition:   "all 0.3s ease",
              }} />
              <span style={{
                fontSize:      "0.65rem",
                fontWeight:    active ? 700 : 500,
                color:         active ? hex : done ? "var(--color-text-secondary)" : "var(--color-text-muted)",
                whiteSpace:    "nowrap",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
              }}>
                {step.replace(/_/g, " ")}
              </span>
            </div>

            {/* Connector line */}
            {idx < steps.length - 1 && (
              <div style={{
                flex:       1,
                height:     2,
                background: done
                  ? `linear-gradient(90deg, ${hex}, ${getStatusConfig(steps[idx + 1]).hex})`
                  : "var(--color-surface-3)",
                marginBottom: "1.1rem",
                transition:  "background 0.3s ease",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Timeline;