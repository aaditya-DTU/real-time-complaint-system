import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PriorityBadge, StatusBadge } from "./PriorityIndicator";
import { useSLA } from "../../hooks/useSLA";
import { formatDateTime, timeAgoShort } from "../../utils/formatDate";
import { useRole } from "../../hooks/useRole";
import { COMPLAINT_TYPE_LABELS } from "../../utils/constants";

/**
 * ComplaintCard — rich complaint summary card
 *
 * Props:
 *   complaint   : object  — full complaint document
 *   onClick     : fn      — optional click override (defaults to navigate)
 *   onAssign    : fn      — admin: assign handler
 *   onUpdateStatus: fn    — staff: update status handler
 *   compact     : boolean — condensed layout (for lists)
 *   showAssignee: boolean
 */
export default function ComplaintCard({
  complaint = {},
  onClick,
  onAssign,
  onUpdateStatus,
  compact = false,
  showAssignee = true,
}) {
  const navigate = useNavigate();
  const { isAdmin, isStaff, isHOD, canAssignComplaints, canUpdateStatus } =
    useRole();
  const [hovered, setHovered] = useState(false);

  const {
    _id,
    title = "Untitled Complaint",
    description = "",
    status = "SUBMITTED",
    priority = "MEDIUM",
    type,
    createdAt,
    assignedTo,
    department,
    slaDeadline,
    slaHours,
  } = complaint;

  // SLA tracking
  const sla = useSLA({
    createdAt,
    type,
    priority,
    slaHours,
    resolved: status === "RESOLVED",
    closed: status === "CLOSED",
  });

  const handleClick = () => {
    if (onClick) {
      onClick(complaint);
      return;
    }
    if (!_id) return;

    // ✅ prefix path based on role
    const base = isAdmin
      ? "/admin"
      : isStaff
        ? "/staff"
        : isHOD
          ? "/manager"
          : "/user";

    navigate(`${base}/complaints/${_id}`);
  };

  const stopProp = (fn) => (e) => {
    e.stopPropagation();
    fn?.(complaint);
  };

  // SLA bar color
  const slaBarColor = sla.isBreached
    ? "var(--color-danger)"
    : sla.isWarning
      ? "var(--color-warning)"
      : "var(--color-success)";

  return (
    <div
      className="card animate-fade-in"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: compact ? "0.875rem 1rem" : "1.25rem 1.5rem",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: compact ? "0.625rem" : "0.875rem",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition:
          "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
        borderColor: hovered ? "var(--color-surface-3)" : undefined,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Priority accent strip on left edge */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 3,
          background: (() => {
            const cfg = {
              CRITICAL: "#ef4444",
              HIGH: "#f97316",
              MEDIUM: "#f59e0b",
              LOW: "#22c55e",
            };
            return cfg[priority] ?? "var(--color-accent)";
          })(),
          borderRadius: "4px 0 0 4px",
        }}
      />

      {/* ── Row 1: Title + Status ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "0.75rem",
          paddingLeft: "0.5rem",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4
            style={{
              fontFamily: "var(--font-display)",
              fontSize: compact ? "0.9rem" : "1rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--color-text-primary)",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </h4>

          {/* Complaint ID */}
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              color: "var(--color-text-muted)",
            }}
          >
            #{_id?.slice(-8) ?? "—"}
          </span>
        </div>

        <StatusBadge status={status} size={compact ? "sm" : "md"} />
      </div>

      {/* ── Row 2: Description (not compact) ── */}
      {!compact && description && (
        <p
          className="truncate-2"
          style={{
            fontSize: "0.85rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.55,
            paddingLeft: "0.5rem",
          }}
        >
          {description}
        </p>
      )}

      {/* ── Row 3: Metadata chips ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          alignItems: "center",
          paddingLeft: "0.5rem",
        }}
      >
        <PriorityBadge priority={priority} size={compact ? "sm" : "md"} />

        {type && (
          <span className="chip" style={{ fontSize: "0.72rem" }}>
            {COMPLAINT_TYPE_LABELS[type] ?? type}
          </span>
        )}

        {department && (
          <span className="chip" style={{ fontSize: "0.72rem" }}>
            🏢 {department}
          </span>
        )}

        {showAssignee && assignedTo && (
          <span className="chip" style={{ fontSize: "0.72rem" }}>
            👤 {assignedTo?.name ?? "Assigned"}
          </span>
        )}
      </div>

      {/* ── Row 4: SLA bar ── */}
      {createdAt && status !== "CLOSED" && (
        <div style={{ paddingLeft: "0.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.3rem",
            }}
          >
            <span
              style={{
                fontSize: "0.72rem",
                color: "var(--color-text-muted)",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              SLA
            </span>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: slaBarColor,
                fontFamily: "var(--font-mono)",
                animation: sla.isBreached
                  ? "sla-pulse 1.5s ease-in-out infinite"
                  : "none",
              }}
            >
              {sla.label}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(sla.percent, 100)}%`,
                background: slaBarColor,
                boxShadow: sla.isBreached ? `0 0 8px ${slaBarColor}` : "none",
              }}
            />
          </div>
        </div>
      )}

      {/* ── Row 5: Footer ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingLeft: "0.5rem",
          marginTop: "auto",
        }}
      >
        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
          {createdAt ? timeAgoShort(createdAt) : "—"}
        </span>

        {/* Action buttons (shown on hover) */}
        {(canAssignComplaints || canUpdateStatus) && (
          <div
            style={{
              display: "flex",
              gap: "0.375rem",
              opacity: hovered ? 1 : 0,
              transform: hovered ? "translateX(0)" : "translateX(8px)",
              transition: "opacity 0.2s ease, transform 0.2s ease",
            }}
          >
            {canAssignComplaints && !assignedTo && onAssign && (
              <button
                onClick={stopProp(onAssign)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "0.72rem", padding: "0.25rem 0.6rem" }}
              >
                Assign
              </button>
            )}
            {canUpdateStatus && onUpdateStatus && status !== "CLOSED" && (
              <button
                onClick={stopProp(onUpdateStatus)}
                className="btn btn-primary btn-sm"
                style={{ fontSize: "0.72rem", padding: "0.25rem 0.6rem" }}
              >
                Update
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Compact list row variant ───────────────────────────────
export function ComplaintRow({ complaint = {}, onClick, onAction }) {
  const {
    _id,
    title = "Untitled",
    status = "SUBMITTED",
    priority = "MEDIUM",
    type,
    createdAt,
  } = complaint;

  const sla = useSLA({
    createdAt,
    type,
    priority,
    resolved: status === "RESOLVED" || status === "CLOSED",
  });

  return (
    <tr onClick={() => onClick?.(complaint)} style={{ cursor: "pointer" }}>
      <td>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: "0.875rem",
              color: "var(--color-text-primary)",
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              color: "var(--color-text-muted)",
            }}
          >
            #{_id?.slice(-8)}
          </span>
        </div>
      </td>
      <td>
        <StatusBadge status={status} size="sm" />
      </td>
      <td>
        <PriorityBadge priority={priority} size="sm" />
      </td>
      <td>
        <span
          style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: sla.isBreached
              ? "var(--color-danger)"
              : sla.isWarning
                ? "var(--color-warning)"
                : "var(--color-success)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {sla.label}
        </span>
      </td>
      <td style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
        {createdAt ? timeAgoShort(createdAt) : "—"}
      </td>
      {onAction && (
        <td>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction(complaint);
            }}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: "0.75rem" }}
          >
            View →
          </button>
        </td>
      )}
    </tr>
  );
}
