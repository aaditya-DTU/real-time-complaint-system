import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMyComplaints } from "../../hooks/useComplaints";
import ComplaintCard from "../../components/complaint/ComplaintCard";
import { FilterBar } from "../../components/dashboard/Section";
import { NoComplaints, NoResults, ErrorState } from "../../components/dashboard/EmptyState";
import { SkeletonCardGrid } from "../../components/common/Loader";
import { COMPLAINT_STATUS, COMPLAINT_TYPES, PRIORITY } from "../../utils/constants";

const STATUS_OPTIONS = Object.entries(COMPLAINT_STATUS).map(([v, k]) => ({
  value: v,
  label: v.replace(/_/g, " "),
}));
const TYPE_OPTIONS = Object.entries(COMPLAINT_TYPES).map(([v]) => ({
  value: v, label: v,
}));
const PRIORITY_OPTIONS = Object.entries(PRIORITY).map(([v]) => ({
  value: v, label: v,
}));

export default function MyComplaints() {
  const navigate = useNavigate();

  const [search,  setSearch]  = useState("");
  const [filters, setFilters] = useState({ status: "", type: "", priority: "" });

  const { data: complaints, loading, error, refetch } = useMyComplaints();

  const handleFilterChange = (key, value) =>
    setFilters((p) => ({ ...p, [key]: value }));

  const handleClear = () => {
    setSearch("");
    setFilters({ status: "", type: "", priority: "" });
  };

  // Client-side filter (API already fetched; for server-side pass filters to hook)
  const filtered = (complaints ?? []).filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.title?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c._id?.includes(q);
    const matchStatus   = !filters.status   || c.status   === filters.status;
    const matchType     = !filters.type     || c.type     === filters.type;
    const matchPriority = !filters.priority || c.priority === filters.priority;
    return matchSearch && matchStatus && matchType && matchPriority;
  });

  const hasFilters = search || filters.status || filters.type || filters.priority;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 800,
            fontSize: "1.5rem", letterSpacing: "-0.03em", margin: 0,
          }}>
            My Complaints
          </h1>
          {!loading && (
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
              {complaints?.length ?? 0} total · {filtered.length} shown
            </p>
          )}
        </div>
        <button
          onClick={() => navigate("/user/submit")}
          className="btn btn-primary btn-sm"
        >
          + New Complaint
        </button>
      </div>

      {/* ── Filter bar ── */}
      <FilterBar
        search={search}
        onSearch={setSearch}
        filters={[
          { key: "status",   label: "All Statuses",   options: STATUS_OPTIONS },
          { key: "type",     label: "All Types",      options: TYPE_OPTIONS },
          { key: "priority", label: "All Priorities", options: PRIORITY_OPTIONS },
        ]}
        values={filters}
        onChange={handleFilterChange}
        onClear={handleClear}
        placeholder="Search by title, ID…"
      />

      {/* ── Content ── */}
      {loading ? (
        <SkeletonCardGrid count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        hasFilters
          ? <NoResults query={search} onClear={handleClear} />
          : <NoComplaints onSubmit={() => navigate("/user/submit")} />
      ) : (
        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap:                 "1rem",
        }}>
          {filtered.map((c) => (
            <ComplaintCard
              key={c._id}
              complaint={c}
              onClick={() => navigate(`/user/complaints/${c._id}`)}
              showAssignee={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}