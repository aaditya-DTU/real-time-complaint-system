import { useEffect, useRef, useState } from "react";
import axios from "../../api/axios";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const CAT_COLORS = [
  "#378ADD","#1D9E75","#EF9F27","#D4537E",
  "#7F77DD","#D85A30","#639922","#BA7517",
];

const STATUS_CFG = {
  SUBMITTED:   { bar: "#378ADD", bg: "#E6F1FB", text: "#0C447C" },
  ASSIGNED:    { bar: "#7F77DD", bg: "#EEEDFE", text: "#3C3489" },
  IN_PROGRESS: { bar: "#EF9F27", bg: "#FAEEDA", text: "#633806" },
  RESOLVED:    { bar: "#639922", bg: "#EAF3DE", text: "#27500A" },
  CLOSED:      { bar: "#888780", bg: "#F1EFE8", text: "#444441" },
  ESCALATED:   { bar: "#E24B4A", bg: "#FCEBEB", text: "#791F1F" },
};

export default function Reports() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const catRef     = useRef(null);
  const donutRef   = useRef(null);
  const catChart   = useRef(null);
  const donutChart = useRef(null);

  useEffect(() => {
    axios.get("/admin/reports")
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!data) return;
    catChart.current?.destroy();
    donutChart.current?.destroy();

    const cats     = data.byCategory || [];
    const statuses = data.byStatus   || [];

    catChart.current = new Chart(catRef.current, {
      type: "bar",
      data: {
        labels: cats.map((c) => c._id),
        datasets: [{
          label: "Complaints",
          data: cats.map((c) => c.total),
          backgroundColor: cats.map((_, i) => CAT_COLORS[i % CAT_COLORS.length]),
          borderRadius: 5,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.raw} complaints` } },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#888780", font: { size: 11 }, maxRotation: 30, autoSkip: false },
          },
          y: {
            grid: { color: "rgba(136,135,128,0.12)" },
            ticks: { color: "#888780", font: { size: 11 } },
            beginAtZero: true,
          },
        },
      },
    });

    donutChart.current = new Chart(donutRef.current, {
      type: "doughnut",
      data: {
        labels: statuses.map((s) => s._id.replace("_", " ")),
        datasets: [{
          data: statuses.map((s) => s.total),
          backgroundColor: statuses.map((s) => (STATUS_CFG[s._id] || { bar: "#888780" }).bar),
          borderWidth: 0,
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw}` } },
        },
      },
    });

    return () => {
      catChart.current?.destroy();
      donutChart.current?.destroy();
    };
  }, [data]);

  const downloadCSV = () => {
    if (!data) return;
    const resolved = data.byStatus?.find((s) => s._id === "RESOLVED")?.total ?? 0;
    const rate = data.total > 0 ? Math.round((data.slaBreached / data.total) * 100) : 0;
    const rows = [
      ["COMPLAINT SYSTEM — DETAILED REPORT"],
      [`Generated: ${new Date().toLocaleString("en-IN")}`],
      [], ["== SUMMARY =="],
      ["Total Complaints", data.total],
      ["SLA Breached", data.slaBreached],
      ["Breach Rate", `${rate}%`],
      ["Resolved", resolved],
      [], ["== BY CATEGORY =="], ["Category", "Count"],
      ...(data.byCategory || []).map((c) => [c._id, c.total]),
      [], ["== BY STATUS =="], ["Status", "Count"],
      ...(data.byStatus || []).map((s) => [s._id, s.total]),
    ];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `complaint-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (loading) return <p className="text-slate-400 p-6">Loading reports...</p>;
  if (!data)   return <p className="text-red-400 p-6">Failed to load reports.</p>;

  const resolved = data.byStatus?.find((s) => s._id === "RESOLVED")?.total ?? 0;
  const rate     = data.total > 0 ? Math.round((data.slaBreached / data.total) * 100) : 0;
  const sMax     = Math.max(...(data.byStatus || []).map((s) => s.total), 1);
  const cats     = data.byCategory || [];
  const statuses = data.byStatus   || [];

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-sm text-slate-400 mt-1">
            Live snapshot ·{" "}
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </p>
        </div>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 text-sm font-medium transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
          </svg>
          Download report
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total complaints", value: data.total,       color: "text-slate-100" },
          { label: "SLA breached",     value: data.slaBreached, color: "text-red-400" },
          { label: "Breach rate",      value: `${rate}%`,       color: rate > 20 ? "text-red-400" : "text-amber-400" },
          { label: "Resolved",         value: resolved,          color: "text-emerald-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">{label}</p>
            <p className={`text-3xl font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Category bar chart */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-4">
            By category
          </p>
          <div style={{ position: "relative", height: 220 }}>
            <canvas ref={catRef} role="img" aria-label="Bar chart of complaints by category">
              {cats.map((c) => `${c._id}: ${c.total}`).join(", ")}
            </canvas>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            {cats.map((c, i) => (
              <span key={c._id} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ background: CAT_COLORS[i % CAT_COLORS.length] }}
                />
                {c._id} ({c.total})
              </span>
            ))}
          </div>
        </div>

        {/* Status: bars + donut */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-4">
            By status
          </p>
          <div className="space-y-3 mb-5">
            {statuses.map((s) => {
              const c   = STATUS_CFG[s._id] || { bar: "#888780" };
              const pct = Math.round((s.total / sMax) * 100);
              return (
                <div key={s._id} className="flex items-center gap-3">
                  <span className="text-xs text-slate-300 w-24 flex-shrink-0 truncate">
                    {s._id.replace("_", " ")}
                  </span>
                  <div className="flex-1 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: c.bar }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-5 text-right tabular-nums">
                    {s.total}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ position: "relative", height: 160 }}>
            <canvas ref={donutRef} role="img" aria-label="Doughnut chart of complaints by status">
              {statuses.map((s) => `${s._id}: ${s.total}`).join(", ")}
            </canvas>
          </div>
        </div>
      </div>

      {/* Status pills */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-4">
          Status breakdown
        </p>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => {
            const c   = STATUS_CFG[s._id] || { bg: "#F1EFE8", text: "#444441" };
            const pct = data.total > 0 ? Math.round((s.total / data.total) * 100) : 0;
            return (
              <span
                key={s._id}
                className="text-xs font-medium px-3.5 py-1.5 rounded-full"
                style={{ background: c.bg, color: c.text }}
              >
                {s._id.replace("_", " ")} · {s.total} · {pct}%
              </span>
            );
          })}
        </div>
      </div>

    </div>
  );
}