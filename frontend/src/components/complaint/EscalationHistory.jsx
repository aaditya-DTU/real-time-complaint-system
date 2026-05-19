import { useEffect, useState } from "react";
import { getEscalationHistory } from "../../api/complaint.api";
import { formatDateTime, timeAgo, formatSLACountdown } from "../../utils/formatDate";
import { PriorityBadge } from "./PriorityIndicator";

/**
 * EscalationHistory — shows all escalation events for a complaint.
 *
 * Props:
 *   complaintId : string  — fetch from API
 *   escalations : array   — OR pass directly (skips fetch)
 *   compact     : boolean
 */
export default function EscalationHistory({
  complaintId,
  escalations: propEscalations,
  compact = false,
}) {
  const [escalations, setEscalations] = useState(propEscalations ?? []);
  const [loading, setLoading]         = useState(!propEscalations && !!complaintId);
  const [error, setError]             = useState(null);

  useEffect(() => {
    if (propEscalations) { setEscalations(propEscalations); return; }
    if (!complaintId) return;

    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getEscalationHistory(complaintId);
        setEscalations(data.escalations ?? data ?? []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [complaintId, propEscalations]);

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {[1, 2].map((i) => (
          <div key={i} className="card" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div className="skeleton" style={{ height: 12, width: "50%" }} />
            <div className="skeleton" style={{ height: 10, width: "80%" }} />
            <div className="skeleton" style={{ height: 10, width: "60%" }} />
          </div>
        ))}
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{
        padding: "1rem",
        background: "var(--color-danger-dim)",
        border: "1px solid rgba(239,68,68,0.2)",
        borderRadius: "var(--radius-md)",
        fontSize: "0.875rem",
        color: "var(--color-danger)",
      }}>
        Failed to load escalation history: {error}
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────
  if (!escalations.length) {
    return (
      <div className="empty-state" style={{ padding: compact ? "1.5rem" : "2.5rem" }}>
        <div className="empty-icon" style={{ fontSize: "1.25rem" }}>✅</div>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
          No escalations — SLA has been maintained
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? "0.75rem" : "1rem" }}>
      {/* Summary header */}
      {!compact && (
        <div style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          padding: "0.625rem 0.875rem",
          background: "var(--color-danger-dim)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "var(--radius-md)",
        }}>
          <span style={{ fontSize: "1rem" }}>🚨</span>
          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--color-danger)" }}>
            {escalations.length} escalation{escalations.length !== 1 ? "s" : ""} recorded
          </span>
        </div>
      )}

      {/* Escalation entries */}
      {escalations.map((esc, idx) => (
        <EscalationEntry key={esc._id ?? idx} escalation={esc} compact={compact} index={idx + 1} />
      ))}
    </div>
  );
}

// ── Single Escalation Entry ────────────────────────────────
function EscalationEntry({ escalation, compact, index }) {
  const [expanded, setExpanded] = useState(!compact);

  const {
    level          = 1,
    reason,
    escalatedAt,
    escalatedBy,
    resolvedAt,
    previousAssignee,
    newAssignee,
    slaBreachedBy,
    priority,
    notes,
  } = escalation;

  const isResolved = !!resolvedAt;
  const levelColor = level >= 3 ? "var(--color-danger)" : level === 2 ? "var(--color-warning)" : "#f97316";

  return (
    <div
      className="card"
      style={{
        padding:     compact ? "0.75rem 1rem" : "1rem 1.25rem",
        borderLeft:  `3px solid ${levelColor}`,
        gap:         0,
      }}
    >
      {/* Header row */}
      <div
        onClick={() => compact && setExpanded((p) => !p)}
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          cursor:         compact ? "pointer" : "default",
          gap:            "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          {/* Level badge */}
          <span style={{
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            width:           28, height: 28,
            borderRadius:    "var(--radius-sm)",
            background:      `${levelColor}18`,
            border:          `1.5px solid ${levelColor}35`,
            fontSize:        "0.7rem",
            fontWeight:      800,
            color:           levelColor,
            fontFamily:      "var(--font-mono)",
            flexShrink:      0,
          }}>
            L{level}
          </span>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                Escalation #{index}
              </span>
              {priority && <PriorityBadge priority={priority} size="sm" />}
            </div>
            <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
              {escalatedAt ? timeAgo(escalatedAt) : ""}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {isResolved ? (
            <span className="badge" style={{ background: "var(--color-success-dim)", color: "var(--color-success)", borderColor: "rgba(34,197,94,0.2)" }}>
              ✓ Resolved
            </span>
          ) : (
            <span className="badge badge-escalated" style={{ animation: "sla-pulse 2s ease-in-out infinite" }}>
              Active
            </span>
          )}

          {compact && (
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ marginTop: "0.875rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>

          {/* Reason */}
          {reason && (
            <DetailRow label="Reason" icon="📋">
              <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>{reason}</span>
            </DetailRow>
          )}

          {/* SLA breached by */}
          {slaBreachedBy != null && (
            <DetailRow label="SLA Overdue" icon="⏰">
              <span style={{ fontSize: "0.85rem", color: "var(--color-danger)", fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                {typeof slaBreachedBy === "number"
                  ? `${Math.round(slaBreachedBy / 60)} minutes`
                  : slaBreachedBy}
              </span>
            </DetailRow>
          )}

          {/* Assignee change */}
          {(previousAssignee || newAssignee) && (
            <DetailRow label="Reassigned" icon="👥">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
                {previousAssignee && (
                  <span style={{ color: "var(--color-text-muted)", textDecoration: "line-through" }}>
                    {previousAssignee?.name ?? previousAssignee}
                  </span>
                )}
                {previousAssignee && newAssignee && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                )}
                {newAssignee && (
                  <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>
                    {newAssignee?.name ?? newAssignee}
                  </span>
                )}
              </div>
            </DetailRow>
          )}

          {/* Notes */}
          {notes && (
            <DetailRow label="Notes" icon="💬">
              <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", fontStyle: "italic" }}>
                "{notes}"
              </span>
            </DetailRow>
          )}

          {/* Timestamps */}
          <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
            {escalatedAt && (
              <div>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                  Escalated
                </span>
                <p style={{ fontSize: "0.78rem", fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)", margin: "0.1rem 0 0" }}>
                  {formatDateTime(escalatedAt)}
                </p>
              </div>
            )}
            {resolvedAt && (
              <div>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                  Resolved
                </span>
                <p style={{ fontSize: "0.78rem", fontFamily: "var(--font-mono)", color: "var(--color-success)", margin: "0.1rem 0 0" }}>
                  {formatDateTime(resolvedAt)}
                </p>
              </div>
            )}
            {escalatedBy && (
              <div>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                  By
                </span>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", margin: "0.1rem 0 0" }}>
                  {escalatedBy === "SYSTEM" ? "⚙️ System" : escalatedBy?.name ?? escalatedBy}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Detail Row helper ──────────────────────────────────────
function DetailRow({ label, icon, children }) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
      <span style={{ fontSize: "0.8rem", flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <span style={{
          fontSize: "0.68rem", fontWeight: 700,
          letterSpacing: "0.07em", textTransform: "uppercase",
          color: "var(--color-text-muted)",
          display: "block", marginBottom: "0.15rem",
        }}>
          {label}
        </span>
        {children}
      </div>
    </div>
  );
}