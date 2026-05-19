import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useComplaint } from "../../hooks/useComplaints";
import { useRole } from "../../hooks/useRole";
import { useToast } from "../../components/common/Toast";
import { Timeline, StatusTimeline } from "../../components/complaint/Timeline";
import EscalationHistory from "../../components/complaint/EscalationHistory";
import { PriorityBadge, StatusBadge } from "../../components/complaint/PriorityIndicator";
import { SLAProgressCard } from "../../components/dashboard/SLAClock";
import { SkeletonCard } from "../../components/common/Loader";
import { ErrorState } from "../../components/dashboard/EmptyState";
import { ConfirmModal } from "../../components/common/Modal";
import { formatDateTime, timeAgo } from "../../utils/formatDate";
import { COMPLAINT_TYPE_LABELS } from "../../utils/constants";
import { assignComplaint, forceCloseComplaint, getStaffList } from "../../api/admin.api";
import { updateComplaintStatus } from "../../api/complaint.api";
import Button from "../../components/common/Button";

export default function ComplaintTimeline() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const toast      = useToast();
  const { isAdmin, isHOD, isStaff, canAssignComplaints, canUpdateStatus, getAllowedTransitions } = useRole();

  const { complaint, loading, error, refetch } = useComplaint(id);

  // ── Admin: reassign state ──────────────────────────────
  const [staffList,     setStaffList]     = useState([]);
  const [staffLoaded,   setStaffLoaded]   = useState(false);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [reassignOpen,  setReassignOpen]  = useState(false);
  const [reassigning,   setReassigning]   = useState(false);

  // ── Admin: force close state ───────────────────────────
  const [closeOpen,   setCloseOpen]   = useState(false);
  const [closing,     setClosing]     = useState(false);

  // ── Staff: quick status update ─────────────────────────
  const [quickStatus,  setQuickStatus]  = useState("");
  const [quickRemarks, setQuickRemarks] = useState("");
  const [updating,     setUpdating]     = useState(false);

  const loadStaff = async () => {
    if (staffLoaded) return;
    try {
      const data = await getStaffList();
      setStaffList(data.staff ?? data ?? []);
      setStaffLoaded(true);
    } catch {
      toast.error("Failed to load staff list");
    }
  };

  const handleReassign = async () => {
    if (!selectedStaff) return;
    setReassigning(true);
    try {
      await assignComplaint(id, selectedStaff);
      toast.success("Complaint reassigned");
      refetch();
      setReassignOpen(false);
    } catch (e) {
      toast.error(e?.data?.message || "Reassignment failed");
    } finally {
      setReassigning(false);
    }
  };

  const handleForceClose = async () => {
    setClosing(true);
    try {
      await forceCloseComplaint(id, "Admin force-closed");
      toast.success("Complaint closed");
      refetch();
      setCloseOpen(false);
    } catch (e) {
      toast.error(e?.data?.message || "Failed to close");
    } finally {
      setClosing(false);
    }
  };

  const handleQuickUpdate = async () => {
    if (!quickStatus) return;
    setUpdating(true);
    try {
      await updateComplaintStatus(id, quickStatus, quickRemarks);
      toast.success(`Status updated to ${quickStatus}`);
      setQuickStatus("");
      setQuickRemarks("");
      refetch();
    } catch (e) {
      toast.error(e?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  // ── Loading / Error ────────────────────────────────────
  if (loading) {
    return (
      <div style={{ maxWidth: 800, display: "flex", flexDirection: "column", gap: "1rem" }}>
        {[1,2,3].map(i => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!complaint) return null;

  const {
    title, description, status, priority, type,
    createdAt, resolvedAt, department,
    assignedTo, createdBy,
    statusHistory = [], escalations = [], slaHours,
    escalationLevel = 0,
  } = complaint;

  const isResolved = status === "RESOLVED" || status === "CLOSED";
  const allowedTransitions = getAllowedTransitions(status);

  // Build timeline entries
  const timelineEntries = statusHistory.map((h) => ({
    _id:         h._id ?? h.changedAt,
    action:      h.status,
    performedBy: h.changedBy,
    timestamp:   h.changedAt,
    meta: {
      from:    h.previousStatus,
      to:      h.status,
      remarks: h.remarks,
    },
  }));

  // Back route depends on role
  const backRoute = isAdmin ? "/admin/complaints"
    : isHOD   ? "/manager/complaints"
    : "/staff/assigned";

  return (
    <div style={{ maxWidth: 800, display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* ── Back ── */}
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }}>
        ← Back
      </button>

      {/* ── Header card ── */}
      <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-0.03em", margin: 0 }}>
              {title}
            </h1>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
              #{id?.slice(-8)} · submitted {timeAgo(createdAt)}
            </span>
          </div>
          <StatusBadge status={status} />
        </div>

        {description && (
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.65, margin: 0 }}>
            {description}
          </p>
        )}

        {/* Meta chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
          <PriorityBadge priority={priority} />
          {type       && <span className="chip">📂 {COMPLAINT_TYPE_LABELS[type] ?? type}</span>}
          {department && <span className="chip">🏢 {department}</span>}
          {createdBy  && <span className="chip">👤 By: {createdBy?.name ?? "Student"}</span>}
          {assignedTo && <span className="chip">🔧 Assigned: {assignedTo?.name ?? "Staff"}</span>}
          {!assignedTo && <span className="chip" style={{ color: "var(--color-warning)" }}>📭 Unassigned</span>}
          {escalationLevel > 0 && (
            <span className="badge badge-escalated" style={{ animation: "sla-pulse 2s ease-in-out infinite" }}>
              L{escalationLevel} Escalation
            </span>
          )}
        </div>

        {/* Timestamps */}
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", paddingTop: "0.5rem", borderTop: "1px solid var(--color-border)" }}>
          <TimestampBlock label="Submitted" value={formatDateTime(createdAt)} />
          {resolvedAt && <TimestampBlock label="Resolved" value={formatDateTime(resolvedAt)} color="var(--color-success)" />}
        </div>
      </div>

      {/* ── Status journey ── */}
      <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>
          Complaint Journey
        </h3>
        <StatusTimeline currentStatus={status} escalated={escalationLevel > 0} />
      </div>

      {/* ── SLA ── */}
      <SLAProgressCard createdAt={createdAt} type={type} priority={priority} slaHours={slaHours} resolved={isResolved} closed={status === "CLOSED"} />

      {/* ════════════════════════════════════════════════
          ROLE-SPECIFIC ACTION PANELS
      ════════════════════════════════════════════════ */}

      {/* ── STAFF: Quick status update ── */}
      {isStaff && !isResolved && allowedTransitions.length > 0 && (
        <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem", borderTop: "2px solid var(--color-info)" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>
            🔄 Update Status
          </h3>

          {/* Status buttons */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {allowedTransitions.map((s) => {
              const colors = { IN_PROGRESS: "var(--color-warning)", RESOLVED: "var(--color-success)", ESCALATED: "var(--color-danger)", CLOSED: "#64748b" };
              const c = colors[s] ?? "var(--color-accent)";
              const selected = quickStatus === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuickStatus(selected ? "" : s)}
                  style={{
                    flex: 1, minWidth: 110, padding: "0.55rem 0.75rem",
                    borderRadius: "var(--radius-md)", cursor: "pointer",
                    border: `1.5px solid ${selected ? c : "var(--color-border)"}`,
                    background: selected ? `${c}18` : "var(--color-surface-2)",
                    color: selected ? c : "var(--color-text-secondary)",
                    fontWeight: selected ? 700 : 500, fontSize: "0.85rem",
                    transition: "all 0.15s",
                  }}
                >
                  {s.replace(/_/g, " ")}
                </button>
              );
            })}
          </div>

          {quickStatus && (
            <>
              <textarea
                value={quickRemarks}
                onChange={(e) => setQuickRemarks(e.target.value)}
                placeholder="Add remarks (optional)…"
                rows={3}
                style={{ fontSize: "0.875rem" }}
              />
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <Button variant="primary" size="sm" loading={updating} onClick={handleQuickUpdate}>
                  Save — {quickStatus.replace(/_/g, " ")}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setQuickStatus(""); setQuickRemarks(""); }}>
                  Cancel
                </Button>
              </div>
            </>
          )}

          {/* Full update page link */}
          <button
            onClick={() => navigate(`/staff/update/${id}`)}
            className="btn btn-ghost btn-sm"
            style={{ alignSelf: "flex-start", fontSize: "0.78rem" }}
          >
            Open full update page →
          </button>
        </div>
      )}

      {/* ── ADMIN / HOD: Management actions ── */}
      {(isAdmin || isHOD) && (
        <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem", borderTop: "2px solid var(--color-danger)" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>
            ⚙️ Admin Actions
          </h3>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {/* Reassign */}
            {isAdmin && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setReassignOpen(true); loadStaff(); }}
              >
                👤 Reassign Staff
              </Button>
            )}

            {/* Force close */}
            {isAdmin && status !== "CLOSED" && (
              <Button variant="danger" size="sm" onClick={() => setCloseOpen(true)}>
                🔒 Force Close
              </Button>
            )}

            {/* Navigate to update page (HOD can also update status) */}
            {canUpdateStatus && !isResolved && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(isAdmin ? `/admin/complaints` : `/manager/complaints`)}
              >
                ← Back to complaints
              </Button>
            )}
          </div>

          {/* Inline reassign panel */}
          {reassignOpen && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1rem", background: "var(--color-surface-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
              <label className="form-label">Select Staff Member</label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
              >
                <option value="">Choose staff…</option>
                {staffList.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} {s.department ? `(${s.department})` : ""}
                  </option>
                ))}
              </select>
              <div style={{ display: "flex", gap: "0.625rem" }}>
                <Button variant="primary" size="sm" loading={reassigning} onClick={handleReassign} disabled={!selectedStaff}>
                  Confirm Reassign
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setReassignOpen(false); setSelectedStaff(""); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Escalation history ── */}
      {escalations.length > 0 && (
        <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>
            Escalation History
          </h3>
          <EscalationHistory escalations={escalations} compact />
        </div>
      )}

      {/* ── Activity timeline ── */}
      <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>
          Activity Log
        </h3>
        <Timeline entries={timelineEntries} emptyMessage="No activity recorded yet." />
      </div>

      {/* ── Confirm modals ── */}
      <ConfirmModal
        open={closeOpen}
        onClose={() => setCloseOpen(false)}
        onConfirm={handleForceClose}
        loading={closing}
        variant="danger"
        title="Force Close Complaint?"
        message="This will permanently close the complaint. This action cannot be undone."
        confirmLabel="Force Close"
      />
    </div>
  );
}

// ── Helper ─────────────────────────────────────────────────
function TimestampBlock({ label, value, color }) {
  return (
    <div>
      <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
        {label}
      </span>
      <p style={{ fontSize: "0.8rem", fontFamily: "var(--font-mono)", color: color ?? "var(--color-text-secondary)", margin: "0.1rem 0 0" }}>
        {value}
      </p>
    </div>
  );
}