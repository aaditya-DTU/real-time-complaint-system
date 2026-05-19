import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getComplaintById, updateComplaintStatus } from "../../api/complaint.api";
import { useToast } from "../../components/common/Toast";
import { useRole } from "../../hooks/useRole";
import Button from "../../components/common/Button";
import { StatusBadge, PriorityBadge } from "../../components/complaint/PriorityIndicator";
import { SLAProgressCard } from "../../components/dashboard/SLAClock";
import { Timeline } from "../../components/complaint/Timeline";
import { SkeletonCard } from "../../components/common/Loader";
import { STATUS_LABELS, COMPLAINT_TYPE_LABELS } from "../../utils/constants";
import { timeAgo } from "../../utils/formatDate";

const REMARKS_MAX = 500;

export default function UpdateStatus() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const toast    = useToast();
  const { getAllowedTransitions } = useRole();

  const [complaint, setComplaint] = useState(null);
  const [status,    setStatus]    = useState("");
  const [remarks,   setRemarks]   = useState("");
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");

  // Fetch complaint
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getComplaintById(id);
        const c = data.complaint ?? data;
        setComplaint(c);
        // Pre-select first valid transition
        const allowed = getAllowedTransitions(c.status);
        if (allowed.length) setStatus(allowed[0]);
        else setStatus(c.status);
      } catch (err) {
        setError(err?.message ?? "Failed to load complaint");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const allowedTransitions = complaint
    ? getAllowedTransitions(complaint.status)
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status) return;
    setSaving(true);
    try {
      await updateComplaintStatus(id, status, remarks);
      toast.success(`Status updated to ${STATUS_LABELS[status] ?? status}`);
      navigate(-1);
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: "1rem" }}>
        <SkeletonCard /><SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", color: "var(--color-danger)" }}>{error}</div>
    );
  }

  if (!complaint) return null;

  const { title, description, status: currentStatus, priority, type, createdAt, statusHistory = [] } = complaint;
  const isTerminal = allowedTransitions.length === 0;

  // Timeline entries
  const timelineEntries = statusHistory.map((h) => ({
    _id: h._id ?? h.changedAt,
    action: h.status,
    performedBy: h.changedBy,
    timestamp: h.changedAt,
    meta: { from: h.previousStatus, to: h.status, remarks: h.remarks },
  }));

  return (
    <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* ── Back ── */}
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }}>
        ← Back
      </button>

      {/* ── Complaint summary card ── */}
      <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.03em", margin: 0 }}>
              {title}
            </h2>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
              #{id?.slice(-8)} · {timeAgo(createdAt)}
            </span>
          </div>
          <StatusBadge status={currentStatus} />
        </div>

        {description && (
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>
            {description}
          </p>
        )}

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <PriorityBadge priority={priority} />
          {type && <span className="chip">{COMPLAINT_TYPE_LABELS[type] ?? type}</span>}
        </div>
      </div>

      {/* ── SLA ── */}
      <SLAProgressCard
        createdAt={createdAt}
        type={type}
        priority={priority}
        resolved={currentStatus === "RESOLVED" || currentStatus === "CLOSED"}
      />

      {/* ── Update form ── */}
      <div className="card" style={{ padding: "1.25rem" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", margin: "0 0 1rem" }}>
          Update Status
        </h3>

        {isTerminal ? (
          <div style={{
            padding: "1rem", background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)",
            fontSize: "0.875rem", color: "var(--color-text-muted)", textAlign: "center",
          }}>
            This complaint is <strong style={{ color: "var(--color-text-primary)" }}>{currentStatus}</strong> — no further transitions available.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Status selector — visual buttons */}
            <div className="form-group">
              <label className="form-label">New Status</label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {allowedTransitions.map((s) => {
                  const selected = status === s;
                  const colors = {
                    IN_PROGRESS: "var(--color-warning)",
                    RESOLVED:    "var(--color-success)",
                    CLOSED:      "#64748b",
                    ESCALATED:   "var(--color-danger)",
                  };
                  const c = colors[s] ?? "var(--color-accent)";
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      style={{
                        flex: 1, minWidth: 120,
                        padding: "0.6rem 0.75rem",
                        borderRadius: "var(--radius-md)",
                        border:   `1.5px solid ${selected ? c : "var(--color-border)"}`,
                        background: selected ? `${c}18` : "var(--color-surface-2)",
                        color:  selected ? c : "var(--color-text-secondary)",
                        fontWeight: selected ? 700 : 500,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {STATUS_LABELS[s] ?? s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Remarks */}
            <div className="form-group">
              <label className="form-label">
                Remarks
                <span style={{ color: "var(--color-text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: "0.3rem" }}>
                  (optional)
                </span>
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add context, next steps, or resolution notes…"
                rows={4}
                maxLength={REMARKS_MAX}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.2rem" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
                  {REMARKS_MAX - remarks.length} / {REMARKS_MAX}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Button type="submit" variant="primary" size="lg" loading={saving} disabled={!status}>
                Save Update
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* ── Activity history ── */}
      {timelineEntries.length > 0 && (
        <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>
            History
          </h3>
          <Timeline entries={timelineEntries} />
        </div>
      )}
    </div>
  );
}