import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAssignedComplaints } from "../../hooks/useComplaints";
import ComplaintCard from "../../components/complaint/ComplaintCard";
import { FilterBar } from "../../components/dashboard/Section";
import { NoAssignedComplaints, NoResults, ErrorState } from "../../components/dashboard/EmptyState";
import { SkeletonCardGrid } from "../../components/common/Loader";
import { COMPLAINT_STATUS, PRIORITY } from "../../utils/constants";

const STATUS_OPTIONS = Object.values(COMPLAINT_STATUS)
  .filter((s) => s !== "CLOSED")
  .map((v) => ({ value: v, label: v.replace(/_/g, " ") }));

const PRIORITY_OPTIONS = Object.values(PRIORITY).map((v) => ({ value: v, label: v }));

export default function AssignedComplaints() {
  const navigate = useNavigate();
  const [search,  setSearch]  = useState("");
  const [filters, setFilters] = useState({ status: "", priority: "" });

  // ✅ Uses /complaints/assigned — correct for STAFF role
  const { data: complaints, loading, error, refetch } = useAssignedComplaints();

  const handleFilterChange = (key, val) =>
    setFilters((p) => ({ ...p, [key]: val }));

  const handleClear = () => {
    setSearch("");
    setFilters({ status: "", priority: "" });
  };

  const filtered = (complaints ?? []).filter((c) => {
    const q = search.toLowerCase();
    return (
      (!q || c.title?.toLowerCase().includes(q) || c._id?.includes(q)) &&
      (!filters.status   || c.status   === filters.status) &&
      (!filters.priority || c.priority === filters.priority)
    );
  });

  const hasFilters = search || filters.status || filters.priority;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 800,
            fontSize: "1.5rem", letterSpacing: "-0.03em", margin: 0,
          }}>
            Assigned Complaints
          </h1>
          {!loading && (
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
              {complaints?.length ?? 0} total · {filtered.length} shown
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        search={search}
        onSearch={setSearch}
        filters={[
          { key: "status",   label: "All Statuses",   options: STATUS_OPTIONS },
          { key: "priority", label: "All Priorities", options: PRIORITY_OPTIONS },
        ]}
        values={filters}
        onChange={handleFilterChange}
        onClear={handleClear}
        placeholder="Search by title or ID…"
      />

      {/* Content */}
      {loading ? (
        <SkeletonCardGrid count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        hasFilters
          ? <NoResults query={search} onClear={handleClear} />
          : <NoAssignedComplaints />
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