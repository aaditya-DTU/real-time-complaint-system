import { useNavigate } from "react-router-dom";
import { useComplaintSummary, useMyComplaints } from "../../hooks/useComplaints";
import { useUser } from "../../hooks/useAuth";
import StatCard from "../../components/dashboard/StatCard";
import { SectionHeader } from "../../components/dashboard/Section";
import { NoComplaints } from "../../components/dashboard/EmptyState";
import { SkeletonStats } from "../../components/common/Loader";
import ComplaintCard from "../../components/complaint/ComplaintCard";
import { StatusBadge } from "../../components/complaint/PriorityIndicator";
import { SLABadge } from "../../components/dashboard/SLAClock";
import { timeAgoShort } from "../../utils/formatDate";

export default function UserDashboard() {
  const navigate = useNavigate();
  const user     = useUser();

  const { summary, loading: sumLoading }           = useComplaintSummary("student");
  const { data: recent, loading: listLoading }     = useMyComplaints();

  const stats = summary ?? {};
  const recentComplaints = (recent ?? []).slice(0, 5);

  // Greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

      {/* ── Page Header ── */}
      <div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: "1.6rem", letterSpacing: "-0.03em", margin: 0,
        }}>
          {greeting}, {user?.name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "0.3rem" }}>
          Here's your complaint overview
        </p>
      </div>

      {/* ── KPI Cards ── */}
      {sumLoading ? <SkeletonStats count={4} /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          <StatCard
            title="Total"
            value={stats.total ?? 0}
            icon="📋"
            accent="var(--color-accent)"
            subtitle="All complaints"
          />
          <StatCard
            title="Open"
            value={stats.open ?? 0}
            icon="🔄"
            accent="var(--color-info)"
            subtitle="In progress"
          />
          <StatCard
            title="Resolved"
            value={stats.resolved ?? 0}
            icon="✅"
            accent="var(--color-success)"
            subtitle="Closed out"
          />
          <StatCard
            title="SLA Breached"
            value={stats.breached ?? 0}
            icon="⏰"
            accent={stats.breached > 0 ? "var(--color-danger)" : "var(--color-success)"}
            subtitle={stats.breached > 0 ? "Needs attention" : "All within SLA"}
          />
        </div>
      )}

      {/* ── Quick actions ── */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <button
          onClick={() => navigate("/user/submit")}
          className="btn btn-primary"
        >
          ✍️ Submit New Complaint
        </button>
        <button
          onClick={() => navigate("/user/complaints")}
          className="btn btn-secondary"
        >
          📂 View All Complaints
        </button>
      </div>

      {/* ── Recent Complaints ── */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "1rem 1.25rem",
          borderBottom: "1px solid var(--color-border)",
        }}>
          <SectionHeader
            title="Recent Complaints"
            subtitle="Your latest 5 submissions"
          />
          <button
            onClick={() => navigate("/user/complaints")}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: "0.8rem" }}
          >
            View all →
          </button>
        </div>

        <div style={{ padding: "1rem 1.25rem" }}>
          {listLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <div className="skeleton" style={{ height: 14, width: "50%" }} />
                  <div className="skeleton" style={{ height: 22, width: 80, borderRadius: 99 }} />
                </div>
              ))}
            </div>
          ) : recentComplaints.length === 0 ? (
            <NoComplaints onSubmit={() => navigate("/user/submit")} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {recentComplaints.map((c, i) => (
                <div
                  key={c._id}
                  onClick={() => navigate(`/user/complaints/${c._id}`)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0.75rem 0.25rem",
                    borderBottom: i < recentComplaints.length - 1 ? "1px solid var(--color-border-soft)" : "none",
                    cursor: "pointer", gap: "0.75rem",
                    transition: "background 0.15s",
                    borderRadius: "var(--radius-sm)",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-surface-2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontWeight: 600, fontSize: "0.875rem",
                      color: "var(--color-text-primary)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      margin: 0,
                    }}>
                      {c.title}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", margin: "0.1rem 0 0" }}>
                      {timeAgoShort(c.createdAt)}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
                    <SLABadge
                      createdAt={c.createdAt}
                      type={c.type}
                      priority={c.priority}
                      resolved={c.status === "RESOLVED" || c.status === "CLOSED"}
                    />
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── SLA Urgency banner (only if breaches exist) ── */}
      {!sumLoading && (stats.breached ?? 0) > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: "1rem",
          padding: "1rem 1.25rem",
          background: "var(--color-danger-dim)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "var(--radius-lg)",
        }}>
          <span style={{ fontSize: "1.5rem" }}>🚨</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: "var(--color-danger)", margin: 0, fontSize: "0.9rem" }}>
              {stats.breached} complaint{stats.breached !== 1 ? "s" : ""} SLA breached
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", margin: "0.15rem 0 0" }}>
              These complaints exceeded their deadlines and have been escalated.
            </p>
          </div>
          <button
            onClick={() => navigate("/user/complaints")}
            className="btn btn-danger btn-sm"
          >
            View
          </button>
        </div>
      )}
    </div>
  );
}