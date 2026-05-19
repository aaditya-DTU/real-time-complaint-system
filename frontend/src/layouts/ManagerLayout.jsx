import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import { ToastProvider, useToast } from "../components/common/Toast";
import { onComplaintEscalated, onSLABreached, onDashboardRefresh, onNotification } from "../utils/socket";
import { ROLES } from "../utils/constants";

const MANAGER_LINKS = [
  { section: "Overview" },
  { to: "/manager",          label: "Metrics",             icon: "📈", end: true },
  { section: "Complaints" },
  { to: "/manager/complaints", label: "All Complaints",    icon: "📋" },
  { to: "/manager/escalated",  label: "Escalations",       icon: "🚨" },
  { to: "/manager/breached",   label: "SLA Breached",      icon: "⏰" },
  { section: "Reports" },
  { to: "/manager/reports",    label: "Analytics",         icon: "📊" },
];

function ManagerLayoutInner() {
  const toast = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const unsub1 = onComplaintEscalated((data) => {
      toast.error(`🚨 Escalation: ${data.title ?? data._id?.slice(-6)}`);
    });
    const unsub2 = onSLABreached((data) => {
      toast.warning(`⏰ SLA Breached: ${data.title ?? data._id?.slice(-6)}`);
    });
    const unsub3 = onDashboardRefresh(() => {
      toast.info("Dashboard data refreshed");
    });
    const unsub4 = onNotification((n) => {
      toast.info(n.message ?? String(n));
    });
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
  }, [toast]);

  return (
    <div className="app-layout">
      <Sidebar
        links={MANAGER_LINKS}
        role={ROLES.HOD}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="main-content">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main style={{ flex: 1, overflowY: "auto", background: "var(--color-bg)" }}>
          <div style={{ padding: "1.5rem 2rem", maxWidth: 1280, margin: "0 auto" }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ManagerLayout() {
  return (
    <ToastProvider>
      <ManagerLayoutInner />
    </ToastProvider>
  );
}