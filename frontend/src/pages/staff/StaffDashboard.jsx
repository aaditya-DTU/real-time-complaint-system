import { useNavigate } from "react-router-dom";
import { useComplaintSummary, useAssignedComplaints } from "../../hooks/useComplaints";
import { useUser } from "../../hooks/useAuth";
import StatCard from "../../components/dashboard/StatCard";
import { SkeletonStats, SkeletonCard } from "../../components/common/Loader";
import { SLABadge } from "../../components/dashboard/SLAClock";
import { StatusBadge, PriorityBadge } from "../../components/complaint/PriorityIndicator";
import { NoAssignedComplaints, ErrorState } from "../../components/dashboard/EmptyState";
import { timeAgoShort } from "../../utils/formatDate";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const user     = useUser();

  const { summary, loading: sumLoading, error: sumErr } = useComplaintSummary("staff");
  const { data: complaints, loading: listLoading }      = useAssignedComplaints();

  const stats = summary ?? {};

  // Sort: CRITICAL + SLA warning first
  const urgent = (complaints ?? [])
    .filter((c) => c.status !== "RESOLVED" && c.status !== "CLOSED")
    .sort((a, b) => {
      const pa = a.priority === "CRITICAL" ? 0 : a.priority === "HIGH" ? 1 : 2;
      const pb = b.priority === "CRITICAL" ? 0 : b.priority === "HIGH" ? 1 : 2;
      return pa - pb;
    })
    .slice(0, 6);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

      {/* ── Header ── */}
      <div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: "1.6rem", letterSpacing: "-0.03em", margin: 0,
        }}>
          Staff Dashboard
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "0.3rem" }}>
          Welcome back, {user?.name?.split(" ")[0] ?? "there"}
        </p>
      </div>

      {/* ── KPI Cards ── */}
      {sumLoading ? <SkeletonStats count={4} /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
          <StatCard title="Assigned"    value={stats.assigned   ?? 0} icon="📋" accent="var(--color-info)" />
          <StatCard title="In Progress" value={stats.inProgress ?? 0} icon="🔄" accent="var(--color-warning)" />
          <StatCard title="Escalated"   value={stats.escalated  ?? 0} icon="🚨"
            accent={stats.escalated > 0 ? "var(--color-danger)" : "var(--color-success)"}
            subtitle={stats.escalated > 0 ? "Needs attention" : "All clear"}
          />
          <StatCard title="Resolved"    value={stats.resolved   ?? 0} icon="✅" accent="var(--color-success)"
            trend={stats.resolvedTrend} trendLabel="vs last week"
          />
        </div>
      )}

      {/* ── Escalated alert ── */}
      {!sumLoading && (stats.escalated ?? 0) > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: "1rem",
          padding: "0.875rem 1.25rem",
          background: "var(--color-danger-dim)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "var(--radius-lg)",
        }}>
          <span style={{ fontSize: "1.25rem" }}>🚨</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: "var(--color-danger)", margin: 0, fontSize: "0.875rem" }}>
              {stats.escalated} escalated complaint{stats.escalated !== 1 ? "s" : ""} require your attention
            </p>
          </div>
          <button onClick={() => navigate("/staff/escalated")} className="btn btn-danger btn-sm">
            Review
          </button>
        </div>
      )}

      {/* ── Urgent queue ── */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "1rem 1.25rem",
          borderBottom: "1px solid var(--color-border)",
        }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>
              Priority Queue
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", margin: "0.1rem 0 0" }}>
              Active complaints sorted by urgency
            </p>
          </div>
          <button onClick={() => navigate("/staff/assigned")} className="btn btn-ghost btn-sm" style={{ fontSize: "0.8rem" }}>
            View all →
          </button>
        </div>

        <div style={{ padding: "0.75rem 1.25rem" }}>
          {listLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "0.5rem 0" }}>
              {[1,2,3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : urgent.length === 0 ? (
            <NoAssignedComplaints />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {urgent.map((c, i) => (
                <div
                  key={c._id}
                  onClick={() => navigate(`/staff/complaints/${c._id}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.875rem",
                    padding: "0.875rem 0.25rem",
                    borderBottom: i < urgent.length - 1 ? "1px solid var(--color-border-soft)" : "none",
                    cursor: "pointer", borderRadius: "var(--radius-sm)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface-2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  {/* Priority dot */}
                  <div style={{
                    width: 3, height: 40, borderRadius: 99, flexShrink: 0,
                    background: c.priority === "CRITICAL" ? "var(--priority-critical)" :
                                c.priority === "HIGH"     ? "var(--priority-high)"     : "var(--priority-medium)",
                  }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--color-text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.title}
                    </p>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.25rem", flexWrap: "wrap" }}>
                      <PriorityBadge priority={c.priority} size="sm" />
                      <StatusBadge   status={c.status}    size="sm" />
                    </div>
                  </div>

                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <SLABadge createdAt={c.createdAt} type={c.type} priority={c.priority} />
                    <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", margin: "0.2rem 0 0", fontFamily: "var(--font-mono)" }}>
                      {timeAgoShort(c.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}