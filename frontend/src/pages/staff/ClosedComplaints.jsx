import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getResolvedComplaints } from "../../api/complaint.api";
import ComplaintCard from "../../components/complaint/ComplaintCard";
import { SkeletonCard } from "../../components/common/Loader";
import { COMPLAINT_TYPE_LABELS, COMPLAINT_TYPES } from "../../utils/constants";

export default function ClosedComplaints() {
  const navigate    = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Reuses the resolved endpoint — CLOSED complaints are included
      // (backend query: status $in [RESOLVED, CLOSED])
      const data = await getResolvedComplaints();
      const all  = data.complaints ?? data ?? [];
      // Keep only CLOSED ones
      setComplaints(all.filter((c) => c.status === "CLOSED"));
    } catch (e) {
      setError(e.message ?? "Failed to load closed complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = complaints.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.title?.toLowerCase().includes(q) ||
      c._id?.includes(q) ||
      c.description?.toLowerCase().includes(q);
    const matchesType = typeFilter === "ALL" || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const typeOptions = [
    { value: "ALL", label: "All Types" },
    ...Object.values(COMPLAINT_TYPES)
      .filter((t) => t !== "ALL")
      .map((t) => ({ value: t, label: COMPLAINT_TYPE_LABELS[t] ?? t })),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* ── Header ── */}
      <div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: "1.5rem", letterSpacing: "-0.03em", margin: 0,
        }}>
          Closed Complaints
        </h1>
        {!loading && (
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            {filtered.length} closed
          </p>
        )}
      </div>

      {/* ── Filters ── */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14" height="14" fill="none" viewBox="0 0 24 24"
            stroke="var(--color-text-muted)" strokeWidth={2}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search closed complaints…"
            style={{ paddingLeft: "2.25rem", width: "100%" }}
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ minWidth: 140 }}
        >
          {typeOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {(search || typeFilter !== "ALL") && (
          <button
            onClick={() => { setSearch(""); setTypeFilter("ALL"); }}
            className="btn btn-ghost btn-sm"
            style={{ whiteSpace: "nowrap" }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── States ── */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && error && (
        <div style={{
          padding: "1rem 1.25rem",
          background: "var(--color-danger-dim)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "var(--radius-md)",
          fontSize: "0.875rem",
          color: "var(--color-danger)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
        }}>
          <span>{error}</span>
          <button onClick={load} className="btn btn-ghost btn-sm">Retry</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔒</div>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            {search || typeFilter !== "ALL"
              ? "No closed complaints match your filters."
              : "No closed complaints yet."}
          </p>
        </div>
      )}

      {/* ── Complaint cards ── */}
      {!loading && !error && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 720 }}>
          {filtered.map((c) => (
            <ComplaintCard
              key={c._id}
              complaint={c}
              onClick={() => navigate(`/staff/complaints/${c._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}