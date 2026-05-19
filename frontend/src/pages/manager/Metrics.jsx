import { useCallback, useEffect, useState } from "react";
import { getAdminDashboard, getSLAMetrics, getComplaintTrends, getStaffMetrics } from "../../api/admin.api";
import { useToast } from "../../components/common/Toast";
import StatCard, { MiniStat } from "../../components/dashboard/StatCard";
import { TrendLine, StatusDonut, PriorityBar, SLABreachBar } from "../../components/dashboard/Charts";
import { SkeletonStats } from "../../components/common/Loader";
import { ErrorState } from "../../components/dashboard/EmptyState";
import { formatDuration } from "../../utils/formatDate";

export default function Metrics() {
  const toast = useToast();
  const [dash,   setDash]   = useState(null);
  const [sla,    setSla]    = useState(null);
  const [trends, setTrends] = useState([]);
  const [staff,  setStaff]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, s, t, sf] = await Promise.all([
        getAdminDashboard(),
        getSLAMetrics({ days: 30 }),
        getComplaintTrends({ days: 30 }),
        getStaffMetrics().catch(() => []),
      ]);
      setDash(d);
      setSla(s);
      setTrends(t.trends ?? t ?? []);
      setStaff(sf.staff ?? sf ?? []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const d = dash ?? {};
  const statusMap   = d.byStatus   ? Object.fromEntries(d.byStatus.map((x)   => [x._id, x.count ?? x.total])) : {};
  const priorityMap = d.byPriority ? Object.fromEntries(d.byPriority.map((x) => [x._id, x.count ?? x.total])) : {};
  const slaBreachData = (d.byCategory ?? []).map((x) => ({
    name: x._id, total: x.total ?? 0, breached: x.breached ?? 0,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

      {/* ── Header ── */}
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.6rem", letterSpacing: "-0.03em", margin: 0 }}>
          Department Metrics
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "0.3rem" }}>
          30-day performance overview for your department
        </p>
      </div>

      {error ? <ErrorState message={error} onRetry={load} /> : (
        <>
          {/* ── KPIs ── */}
          {loading ? <SkeletonStats count={4} /> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
              <StatCard title="Total"         value={d.total ?? 0}         icon="📋" accent="var(--color-accent)" />
              <StatCard title="Open"          value={d.open ?? 0}          icon="🔄" accent="var(--color-info)" />
              <StatCard title="Resolved"      value={d.resolved ?? 0}      icon="✅" accent="var(--color-success)" />
              <StatCard title="SLA Breached"  value={d.slaBreached ?? 0}   icon="⏰"
                accent={d.slaBreached > 0 ? "var(--color-danger)" : "var(--color-success)"}
              />
            </div>
          )}

          {/* ── SLA compliance card ── */}
          {!loading && sla && (
            <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>
                SLA Compliance — Last 30 Days
              </h3>

              {/* Compliance bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>Compliance Rate</span>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "1rem",
                    color: (sla.complianceRate ?? 0) >= 80 ? "var(--color-success)" : "var(--color-danger)",
                  }}>
                    {sla.complianceRate ?? 0}%
                  </span>
                </div>
                <div className="progress-bar" style={{ height: 8 }}>
                  <div className="progress-fill" style={{
                    width: `${sla.complianceRate ?? 0}%`,
                    background: (sla.complianceRate ?? 0) >= 80 ? "var(--color-success)" : (sla.complianceRate ?? 0) >= 60 ? "var(--color-warning)" : "var(--color-danger)",
                  }} />
                </div>
              </div>

              {/* SLA mini stats */}
              <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", paddingTop: "0.5rem" }}>
                <MiniStat label="Breach Rate"       value={`${sla.breachRate ?? 0}%`}        accent={sla.breachRate > 20 ? "var(--color-danger)" : "var(--color-success)"} />
                <MiniStat label="Avg Breach Time"   value={sla.avgBreachHours != null ? `${Math.round(sla.avgBreachHours)}h` : "—"} accent="var(--color-warning)" />
                <MiniStat label="Total Escalations" value={sla.totalEscalations ?? 0}         accent="var(--color-info)" />
              </div>
            </div>
          )}

          {/* ── Charts ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <StatusDonut  data={statusMap}   loading={loading} />
            <PriorityBar  data={priorityMap} loading={loading} />
          </div>

          <TrendLine data={trends} loading={loading} days={30} />

          <SLABreachBar data={slaBreachData} loading={loading} />

          {/* ── Staff performance table ── */}
          {!loading && staff.length > 0 && (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--color-border)" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>
                  Staff Performance
                </h3>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Assigned</th>
                    <th>Resolved</th>
                    <th>Avg Resolution</th>
                    <th>SLA Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => {
                    const compliance = s.total ? Math.round(((s.total - (s.breached ?? 0)) / s.total) * 100) : 100;
                    return (
                      <tr key={s._id ?? s.name}>
                        <td style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
                          {s.name ?? s._id}
                          {s.department && <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", margin: "0.1rem 0 0" }}>{s.department}</p>}
                        </td>
                        <td style={{ fontFamily: "var(--font-mono)" }}>{s.assigned ?? s.total ?? 0}</td>
                        <td style={{ fontFamily: "var(--font-mono)", color: "var(--color-success)" }}>{s.resolved ?? 0}</td>
                        <td style={{ fontFamily: "var(--font-mono)", color: "var(--color-info)" }}>
                          {s.avgResolutionHours != null
                            ? (s.avgResolutionHours >= 24 ? `${(s.avgResolutionHours/24).toFixed(1)}d` : `${Math.round(s.avgResolutionHours)}h`)
                            : "—"}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div className="progress-bar" style={{ height: 4, flex: 1, minWidth: 60 }}>
                              <div className="progress-fill" style={{
                                width: `${compliance}%`,
                                background: compliance >= 80 ? "var(--color-success)" : compliance >= 60 ? "var(--color-warning)" : "var(--color-danger)",
                              }} />
                            </div>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: compliance >= 80 ? "var(--color-success)" : "var(--color-danger)", flexShrink: 0 }}>
                              {compliance}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}