/**
 * Charts — dashboard chart components using Recharts
 *
 * Exports:
 *   StatusDonut       — complaint status breakdown (donut)
 *   PriorityBar       — complaints by priority (horizontal bar)
 *   TrendLine         — complaint volume over time (area chart)
 *   ResolutionGauge   — avg resolution time metric
 *   SLABreachBar      — SLA breach rate by department/type
 *   DepartmentChart   — complaints by department (bar)
 *
 * All charts:
 *   - Dark theme (uses CSS variables)
 *   - Loading skeleton state
 *   - Empty state handling
 *   - Responsive (ResponsiveContainer)
 */

import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as RTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from "recharts";

import { STATUS_CHART_PALETTE, PRIORITY_CHART_PALETTE, getStatusColor, getPriorityColor } from "../../utils/priorityColor";
import { STATUS_ORDER_LIST, PRIORITY_ORDER } from "../../utils/priorityColor";
import { STATUS_LABELS, PRIORITY_LABELS } from "../../utils/constants";

// ── Shared theme ───────────────────────────────────────────
const THEME = {
  bg:         "transparent",
  text:       "#8b90a0",
  textPrimary:"#eef0f6",
  grid:       "#2a2f3d",
  tooltip: {
    bg:     "#13161e",
    border: "#2a2f3d",
    text:   "#eef0f6",
  },
};

// ── Tooltip ────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:   THEME.tooltip.bg,
      border:       `1px solid ${THEME.tooltip.border}`,
      borderRadius: 8,
      padding:      "0.625rem 0.875rem",
      boxShadow:    "0 4px 16px rgba(0,0,0,0.4)",
    }}>
      {label && (
        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: THEME.textPrimary, marginBottom: "0.3rem" }}>
          {label}
        </p>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
          <span style={{ color: THEME.text }}>{p.name}:</span>
          <span style={{ color: THEME.textPrimary, fontWeight: 700 }}>
            {formatter ? formatter(p.value, p.name) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Chart skeleton ─────────────────────────────────────────
function ChartSkeleton({ height = 260 }) {
  return (
    <div className="skeleton" style={{ height, borderRadius: "var(--radius-md)", width: "100%" }} />
  );
}

// ── Chart wrapper card ─────────────────────────────────────
function ChartCard({ title, subtitle, children, loading, height = 260, actions }) {
  return (
    <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h4 style={{
            fontFamily: "var(--font-display)", fontSize: "0.9rem",
            fontWeight: 700, letterSpacing: "-0.02em", margin: 0,
            color: "var(--color-text-primary)",
          }}>
            {title}
          </h4>
          {subtitle && (
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", margin: "0.15rem 0 0" }}>
              {subtitle}
            </p>
          )}
        </div>
        {actions}
      </div>

      {/* Chart area */}
      {loading ? <ChartSkeleton height={height} /> : (
        <div style={{ height }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── 1. Status Donut ────────────────────────────────────────
export function StatusDonut({ data = {}, loading = false }) {
  const chartData = STATUS_ORDER_LIST
    .filter((s) => data[s] > 0)
    .map((s) => ({
      name:  STATUS_LABELS[s] ?? s,
      value: data[s] ?? 0,
      color: getStatusColor(s),
    }));

  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <ChartCard title="Complaint Status" subtitle={`${total} total`} loading={loading} height={220}>
      {chartData.length === 0 ? (
        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          No data
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%" cy="50%"
              innerRadius="55%" outerRadius="80%"
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <RTooltip content={<ChartTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(v) => <span style={{ fontSize: "0.75rem", color: THEME.text }}>{v}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// ── 2. Priority Bar ────────────────────────────────────────
export function PriorityBar({ data = {}, loading = false }) {
  const chartData = PRIORITY_ORDER
    .map((p) => ({
      name:  PRIORITY_LABELS[p] ?? p,
      count: data[p] ?? 0,
      color: getPriorityColor(p),
    }))
    .filter((d) => d.count > 0);

  return (
    <ChartCard title="By Priority" loading={loading} height={200}>
      {chartData.length === 0 ? (
        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>No data</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} horizontal={false} />
            <XAxis type="number" tick={{ fill: THEME.text, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: THEME.text, fontSize: 11 }} axisLine={false} tickLine={false} width={64} />
            <RTooltip content={<ChartTooltip />} />
            <Bar dataKey="count" name="Complaints" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// ── 3. Trend Line ──────────────────────────────────────────
export function TrendLine({ data = [], loading = false, days = 30 }) {
  // data: [{ date: "2024-01-01", count: 5, resolved: 3 }]
  return (
    <ChartCard
      title="Complaint Trend"
      subtitle={`Last ${days} days`}
      loading={loading}
      height={220}
    >
      {data.length === 0 ? (
        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>No data</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--color-accent)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--color-success)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} />
            <XAxis dataKey="date" tick={{ fill: THEME.text, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: THEME.text, fontSize: 10 }} axisLine={false} tickLine={false} />
            <RTooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="count"    name="Total"    stroke="var(--color-accent)"  fill="url(#gradTotal)"    strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="resolved" name="Resolved" stroke="var(--color-success)" fill="url(#gradResolved)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// ── 4. SLA Breach Bar ──────────────────────────────────────
export function SLABreachBar({ data = [], loading = false }) {
  // data: [{ name: "HOSTEL", total: 20, breached: 5 }]
  const enriched = data.map((d) => ({
    ...d,
    breachRate: d.total ? Math.round((d.breached / d.total) * 100) : 0,
  }));

  return (
    <ChartCard title="SLA Breach Rate" subtitle="by complaint type" loading={loading} height={220}>
      {enriched.length === 0 ? (
        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>No data</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={enriched} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: THEME.text, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: THEME.text, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
            <RTooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} />
            <Bar dataKey="breachRate" name="Breach Rate" radius={[4, 4, 0, 0]}>
              {enriched.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.breachRate >= 50 ? "var(--color-danger)" : entry.breachRate >= 25 ? "var(--color-warning)" : "var(--color-success)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// ── 5. Department Chart ────────────────────────────────────
export function DepartmentChart({ data = [], loading = false }) {
  // data: [{ department: "CSE", count: 12 }]
  return (
    <ChartCard title="By Department" loading={loading} height={220}>
      {data.length === 0 ? (
        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>No data</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke={THEME.grid} vertical={false} />
            <XAxis dataKey="department" tick={{ fill: THEME.text, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: THEME.text, fontSize: 11 }} axisLine={false} tickLine={false} />
            <RTooltip content={<ChartTooltip />} />
            <Bar dataKey="count" name="Complaints" fill="var(--color-accent)" radius={[4, 4, 0, 0]} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// ── 6. Resolution Gauge (simple metric display) ────────────
export function ResolutionMetric({ avgHours, slaHours = 48, loading = false }) {
  const pct       = Math.min((avgHours / slaHours) * 100, 100);
  const color     = pct <= 60 ? "var(--color-success)" : pct <= 90 ? "var(--color-warning)" : "var(--color-danger)";
  const days      = avgHours >= 24 ? `${(avgHours / 24).toFixed(1)}d` : `${Math.round(avgHours)}h`;

  return (
    <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, margin: 0, color: "var(--color-text-primary)" }}>
        Avg Resolution Time
      </h4>

      {loading ? (
        <div className="skeleton" style={{ height: 80 }} />
      ) : (
        <>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "2.5rem", fontWeight: 800, color, letterSpacing: "-0.04em" }}>
              {days}
            </span>
            <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", margin: "0.2rem 0 0" }}>
              avg across resolved complaints
            </p>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>vs SLA target ({slaHours}h)</span>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color }}>{Math.round(pct)}%</span>
            </div>
            <div className="progress-bar" style={{ height: 6 }}>
              <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}