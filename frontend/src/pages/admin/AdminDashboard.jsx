import { useState, useEffect } from "react";
import StatCard from "../../components/dashboard/StatCard";
import { getAdminDashboard } from "../../api/complaint.api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    unassigned: 0,
    slaBreached: 0,
    resolvedToday: 0,
    unassignedList: [],
    breachedList: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAdminDashboard();
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Complaints" value={stats.total} />
        <StatCard title="Unassigned" value={stats.unassigned} />
        <StatCard title="SLA Breached" value={stats.slaBreached} />
        <StatCard title="Resolved Today" value={stats.resolvedToday} />
      </div>

      {/* Attention Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Unassigned Complaints */}
        <div className="bg-slate-800 rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-4">Unassigned Complaints</h2>

          {stats.unassignedList.length === 0 ? (
            <p className="text-slate-400 text-sm">
              All complaints are assigned 🎉
            </p>
          ) : (
            <ul className="space-y-3">
              {stats.unassignedList.map((c) => (
                <li
                  key={c._id}
                  className="flex justify-between items-center border-b border-slate-700 pb-2"
                >
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-xs text-slate-400">{c.department}</p>
                  </div>
                  <span className="text-xs bg-yellow-600 px-2 py-1 rounded">
                    Unassigned
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* SLA Breached */}
        <div className="bg-slate-800 rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-4">SLA Breached</h2>

          {stats.breachedList.length === 0 ? (
            <p className="text-slate-400 text-sm">No SLA breaches 🎉</p>
          ) : (
            <ul className="space-y-3">
              {stats.breachedList.map((c) => (
                <li
                  key={c._id}
                  className="flex justify-between items-center border-b border-slate-700 pb-2"
                >
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-xs text-slate-400">{c.department}</p>
                  </div>
                  <span className="text-xs bg-red-600 px-2 py-1 rounded">
                    Breached
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
