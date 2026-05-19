import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createComplaint } from "../../api/complaint.api";
import { useToast } from "../../components/common/Toast";
import Button from "../../components/common/Button";
import {
  COMPLAINT_TYPES, COMPLAINT_TYPE_LABELS,
  PRIORITY, PRIORITY_LABELS,
  TYPE_PRIORITY_MAP, SLA_RULES,
} from "../../utils/constants";
import { PriorityBadge } from "../../components/complaint/PriorityIndicator";

// Helper: get SLA info string for display
const getSLAInfo = (type, priority) => {
  if (type === COMPLAINT_TYPES.HARASSMENT) return "Immediate escalation";
  const hours = SLA_RULES[type] ?? 48;
  return `${hours}h SLA window`;
};

const CHAR_LIMIT = 1000;

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const toast    = useToast();

  const [form, setForm] = useState({
    title:       "",
    type:        COMPLAINT_TYPES.HOSTEL,
    priority:    TYPE_PRIORITY_MAP[COMPLAINT_TYPES.HOSTEL] ?? PRIORITY.MEDIUM,
    description: "",
    department:  "",
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k) => (e) => {
    const val = e.target.value;
    setForm((p) => {
      const next = { ...p, [k]: val };
      // Auto-set priority when type changes
      if (k === "type") {
        next.priority = TYPE_PRIORITY_MAP[val] ?? PRIORITY.MEDIUM;
      }
      return next;
    });
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())        e.title       = "Title is required";
    else if (form.title.length < 5) e.title      = "Title too short (min 5 chars)";
    if (!form.description.trim())  e.description = "Please describe your complaint";
    else if (form.description.length < 20) e.description = "Description too short (min 20 chars)";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { department, ...payload } = form;
      if (department) payload.department = department;
      await createComplaint(payload);
      setSubmitted(true);
      toast.success("Complaint submitted successfully!");
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ─────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ maxWidth: 520, margin: "3rem auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "var(--color-success-dim)",
          border: "2px solid rgba(34,197,94,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.75rem",
        }}>
          ✅
        </div>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.4rem", margin: 0 }}>
            Complaint submitted!
          </h2>
          <p style={{ color: "var(--color-text-secondary)", marginTop: "0.4rem", fontSize: "0.9rem" }}>
            Your complaint has been received. We'll notify you of every status update in real time.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button variant="primary" onClick={() => navigate("/user/complaints")}>
            View my complaints
          </Button>
          <Button variant="secondary" onClick={() => { setSubmitted(false); setForm({ title: "", type: COMPLAINT_TYPES.HOSTEL, priority: PRIORITY.MEDIUM, description: "", department: "" }); }}>
            Submit another
          </Button>
        </div>
      </div>
    );
  }

  const slaInfo   = getSLAInfo(form.type, form.priority);
  const isUrgent  = form.type === COMPLAINT_TYPES.HARASSMENT || form.priority === PRIORITY.CRITICAL;
  const remaining = CHAR_LIMIT - form.description.length;

  return (
    <div style={{ maxWidth: 620 }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: "1.5rem", letterSpacing: "-0.03em", margin: 0,
        }}>
          Submit a Complaint
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.3rem" }}>
          All complaints are tracked with SLA deadlines and real-time notifications.
        </p>
      </div>

      {/* ── Urgent banner ── */}
      {isUrgent && (
        <div style={{
          display: "flex", gap: "0.75rem", alignItems: "center",
          padding: "0.875rem 1rem", marginBottom: "1.25rem",
          background: "var(--color-danger-dim)",
          border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: "var(--radius-md)",
        }}>
          <span style={{ fontSize: "1.25rem" }}>🚨</span>
          <div>
            <p style={{ fontWeight: 700, color: "var(--color-danger)", margin: 0, fontSize: "0.875rem" }}>
              Urgent — Immediate escalation
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", margin: "0.1rem 0 0" }}>
              This type of complaint is prioritised and will be escalated immediately.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* Title */}
        <div className="form-group">
          <label className="form-label">Complaint Title</label>
          <input
            type="text"
            value={form.title}
            onChange={set("title")}
            placeholder="Brief summary of the issue"
            style={errors.title ? { borderColor: "var(--color-danger)" } : {}}
          />
          {errors.title && <span className="form-error">{errors.title}</span>}
        </div>

        {/* Type + Priority row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select value={form.type} onChange={set("type")}>
              {Object.entries(COMPLAINT_TYPES).map(([k, v]) => (
                <option key={k} value={v}>{COMPLAINT_TYPE_LABELS[v] ?? v}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select value={form.priority} onChange={set("priority")}>
              {Object.entries(PRIORITY).map(([k, v]) => (
                <option key={k} value={v}>{PRIORITY_LABELS[v] ?? v}</option>
              ))}
            </select>
          </div>
        </div>

        {/* SLA preview */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          padding: "0.625rem 0.875rem",
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
        }}>
          <span style={{ fontSize: "0.875rem" }}>⏱️</span>
          <span style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)" }}>
            SLA window:
          </span>
          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: isUrgent ? "var(--color-danger)" : "var(--color-accent)", fontFamily: "var(--font-mono)" }}>
            {slaInfo}
          </span>
          <div style={{ marginLeft: "auto" }}>
            <PriorityBadge priority={form.priority} size="sm" />
          </div>
        </div>

        {/* Department (optional) */}
        <div className="form-group">
          <label className="form-label">Department <span style={{ color: "var(--color-text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
          <input
            type="text"
            value={form.department}
            onChange={set("department")}
            placeholder="e.g. Computer Science, Hostel Block B…"
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            value={form.description}
            onChange={set("description")}
            placeholder="Describe the issue in detail — what happened, when, and any relevant context…"
            rows={5}
            maxLength={CHAR_LIMIT}
            style={errors.description ? { borderColor: "var(--color-danger)" } : {}}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.2rem" }}>
            {errors.description
              ? <span className="form-error">{errors.description}</span>
              : <span />
            }
            <span style={{
              fontSize: "0.72rem",
              color: remaining < 50 ? "var(--color-warning)" : "var(--color-text-muted)",
              fontFamily: "var(--font-mono)",
            }}>
              {remaining} / {CHAR_LIMIT}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button type="submit" variant="primary" size="lg" loading={loading}>
            Submit Complaint
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}