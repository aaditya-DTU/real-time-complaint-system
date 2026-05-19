import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getResolvedComplaints } from "../../api/complaint.api";
import { FilterBar } from "../../components/dashboard/Section";
import {
  StatusBadge,
  PriorityBadge,
} from "../../components/complaint/PriorityIndicator";
import { SkeletonTable } from "../../components/common/Loader";
import { ErrorState } from "../../components/dashboard/EmptyState";
import { timeAgoShort, getResolutionTime } from "../../utils/formatDate";
import { COMPLAINT_TYPE_LABELS } from "../../utils/constants";
import toast from "react-hot-toast";
import { closeComplaint } from "../../api/complaint.api"; // ← swap import

export default function ResolvedComplaints() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ type: "" });
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [closing, setClosing] = useState(null); // id of complaint being closed

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getResolvedComplaints();
      setComplaints(data.complaints ?? data ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleClose = async (e, complaintId) => {
    e.stopPropagation();
    if (closing) return;
    setClosing(complaintId);
    try {
      await closeComplaint(complaintId); 
      toast.success("Complaint closed");
      setComplaints((prev) => prev.filter((c) => c._id !== complaintId));
    } catch (err) {
      toast.error(err?.data?.message || "Failed to close complaint");
    } finally {
      setClosing(null);
    }
  };

  const filtered = complaints.filter((c) => {
    const q = search.toLowerCase();
    return (
      (!q || c.title?.toLowerCase().includes(q) || c._id?.includes(q)) &&
      (!filters.type || c.type === filters.type)
    );
  });

  const TYPE_OPTIONS = [
    ...new Set(complaints.map((c) => c.type).filter(Boolean)),
  ].map((t) => ({ value: t, label: COMPLAINT_TYPE_LABELS[t] ?? t }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "1.5rem",
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          Resolved Complaints
        </h1>
        {!loading && (
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--color-text-muted)",
              marginTop: "0.25rem",
            }}
          >
            {filtered.length} resolved
          </p>
        )}
      </div>

      {/* Filters */}
      <FilterBar
        search={search}
        onSearch={setSearch}
        filters={[{ key: "type", label: "All Types", options: TYPE_OPTIONS }]}
        values={filters}
        onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onClear={() => {
          setSearch("");
          setFilters({ type: "" });
        }}
        placeholder="Search resolved complaints…"
      />

      {/* Content */}
      {loading ? (
        <SkeletonTable rows={5} cols={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            {search ? "No results found." : "No resolved complaints yet."}
          </p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Complaint</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Resolution time</th>
                <th>Resolved</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c._id}
                  onClick={() => navigate(`/staff/complaints/${c._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Complaint title + ID */}
                  <td>
                    <div>
                      <p
                        style={{
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          color: "var(--color-text-primary)",
                          margin: 0,
                          maxWidth: 240,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c.title}
                      </p>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.7rem",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        #{c._id?.slice(-8)}
                      </span>
                    </div>
                  </td>

                  {/* Type */}
                  <td>
                    <span className="chip" style={{ fontSize: "0.72rem" }}>
                      {COMPLAINT_TYPE_LABELS[c.type] ?? c.type ?? "—"}
                    </span>
                  </td>

                  {/* Priority */}
                  <td>
                    <PriorityBadge priority={c.priority} size="sm" />
                  </td>

                  {/* Resolution time — hours/mins between createdAt and resolvedAt */}
                  <td>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: c.resolvedAt
                          ? "var(--color-success)"
                          : "var(--color-text-muted)",
                      }}
                    >
                      {c.resolvedAt ? (
                        getResolutionTime(c.createdAt, c.resolvedAt)
                      ) : (
                        <span
                          style={{
                            color: "var(--color-warning)",
                            fontSize: "0.78rem",
                          }}
                        >
                          resolvedAt missing
                        </span>
                      )}
                    </span>
                  </td>

                  {/* Resolved time ago */}
                  <td
                    style={{
                      color: "var(--color-text-muted)",
                      fontSize: "0.8rem",
                    }}
                  >
                    {c.resolvedAt ? timeAgoShort(c.resolvedAt) : "—"}
                  </td>

                  {/* Close button */}
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleClose(e, c._id)}
                      disabled={closing === c._id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        padding: "0.35rem 0.85rem",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        borderRadius: "var(--radius-md)",
                        border: "1.5px solid rgba(100,116,139,0.5)",
                        background:
                          closing === c._id
                            ? "rgba(100,116,139,0.08)"
                            : "transparent",
                        color:
                          closing === c._id
                            ? "var(--color-text-muted)"
                            : "var(--color-text-secondary)",
                        cursor: closing === c._id ? "not-allowed" : "pointer",
                        transition: "all 0.15s",
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={(e) => {
                        if (closing !== c._id) {
                          e.currentTarget.style.background =
                            "rgba(100,116,139,0.12)";
                          e.currentTarget.style.borderColor =
                            "rgba(100,116,139,0.8)";
                          e.currentTarget.style.color =
                            "var(--color-text-primary)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor =
                          "rgba(100,116,139,0.5)";
                        e.currentTarget.style.color =
                          "var(--color-text-secondary)";
                      }}
                    >
                      {closing === c._id ? (
                        <>
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              border: "1.5px solid currentColor",
                              borderTopColor: "transparent",
                              borderRadius: "50%",
                              display: "inline-block",
                              animation: "spin 0.6s linear infinite",
                            }}
                          />
                          Closing…
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Close
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
