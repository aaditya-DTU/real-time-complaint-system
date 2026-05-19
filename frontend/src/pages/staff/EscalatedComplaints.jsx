import { useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEscalatedComplaints } from "../../api/complaint.api";
import ComplaintCard from "../../components/complaint/ComplaintCard";
import { FilterBar } from "../../components/dashboard/Section";
import { NoEscalations, ErrorState } from "../../components/dashboard/EmptyState";
import { SkeletonCardGrid } from "../../components/common/Loader";
import { PRIORITY } from "../../utils/constants";
import { onComplaintEscalated } from "../../utils/socket";

const PRIORITY_OPTIONS = Object.values(PRIORITY).map((v) => ({ value: v, label: v }));

export default function EscalatedComplaints() {
  const navigate = useNavigate();
  const [search,  setSearch]  = useState("");
  const [filters, setFilters] = useState({ priority: "" });
  const [complaints, setComplaints] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  // ✅ Uses /complaints/escalated — correct for STAFF role
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEscalatedComplaints();
      setComplaints(data.complaints ?? data ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Live update when a new escalation comes in
    const unsub = onComplaintEscalated(() => load());
    return unsub;
  }, []);

  const filtered = complaints.filter((c) => {
    const q = search.toLowerCase();
    return (
      (!q || c.title?.toLowerCase().includes(q) || c._id?.includes(q)) &&
      (!filters.priority || c.priority === filters.priority)
    );
  });

  const hasFilters = search || filters.priority;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header */}
      <div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: "1.5rem", letterSpacing: "-0.03em", margin: 0,
        }}>
          Escalated Complaints
        </h1>
        {!loading && (
          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            {filtered.length} escalated complaint{filtered.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Alert banner */}
      {!loading && filtered.length > 0 && (
        <div style={{
          display: "flex", gap: "0.75rem", alignItems: "center",
          padding: "0.875rem 1.1rem",
          background: "var(--color-danger-dim)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "var(--radius-md)",
        }}>
          <span style={{ fontSize: "1.1rem" }}>🚨</span>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-danger)", fontWeight: 600 }}>
            These complaints have breached SLA and been escalated. Update status immediately.
          </p>
        </div>
      )}

      {/* Filters */}
      <FilterBar
        search={search}
        onSearch={setSearch}
        filters={[
          { key: "priority", label: "All Priorities", options: PRIORITY_OPTIONS },
        ]}
        values={filters}
        onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClear={() => { setSearch(""); setFilters({ priority: "" }); }}
        placeholder="Search escalated complaints…"
      />

      {/* Content */}
      {loading ? (
        <SkeletonCardGrid count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        hasFilters
          ? <NoResults query={search} onClear={() => { setSearch(""); setFilters({ priority: "" }); }} />
          : <NoEscalations />
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1rem",
        }}>
          {filtered.map((c) => (
            <ComplaintCard
              key={c._id}
              complaint={c}
              onClick={() => navigate(`/staff/complaints/${c._id}`)}
              onUpdateStatus={() => navigate(`/staff/update/${c._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NoResults({ query, onClear }) {
  return (
    <div className="empty-state" style={{ padding: "2.5rem" }}>
      <div className="empty-icon">🔍</div>
      <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
        {query ? `No results for "${query}"` : "No items match your filters."}
      </p>
      <button onClick={onClear} className="btn btn-ghost btn-sm">Clear filters</button>
    </div>
  );
}