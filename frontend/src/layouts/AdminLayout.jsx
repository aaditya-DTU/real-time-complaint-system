import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import { ToastProvider, useToast } from "../components/common/Toast";
import {
  onComplaintEscalated,
  onSLABreached,
  onComplaintUpdated,
  onDashboardRefresh,
  onNotification,
} from "../utils/socket";
import { ROLES } from "../utils/constants";

const ADMIN_LINKS = [
  { section: "Overview" },
  { to: "/admin",                   label: "Dashboard",         icon: "📊", end: true },
  { section: "Complaints" },
  { to: "/admin/complaints",        label: "All Complaints",    icon: "📋" },
  { to: "/admin/escalated",         label: "Breached / Escalated", icon: "🚨" },
  { section: "Configuration" },
  { to: "/admin/escalation-rules",  label: "Escalation Rules",  icon: "⚡" },
  { to: "/admin/sla",               label: "SLA Config",        icon: "⏱️" },
  { section: "Analytics" },
  { to: "/admin/reports",           label: "Reports",           icon: "📈" },
];

function AdminLayoutInner() {
  const toast = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const unsub1 = onComplaintEscalated((data) => {
      toast.error(`🚨 Escalated: ${data.title ?? `#${data._id?.slice(-6)}`}`);
    });
    const unsub2 = onSLABreached((data) => {
      toast.warning(`⏰ SLA Breached: ${data.title ?? `#${data._id?.slice(-6)}`}`);
    });
    const unsub3 = onComplaintUpdated((data) => {
      if (data.status === "RESOLVED") {
        toast.success(`✅ Resolved: ${data.title ?? `#${data._id?.slice(-6)}`}`);
      }
    });
    const unsub4 = onDashboardRefresh(() => {
      // silent — dashboard pages handle their own refresh
    });
    const unsub5 = onNotification((n) => {
      toast.info(n.message ?? String(n));
    });
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); unsub5(); };
  }, [toast]);

  return (
    <div className="app-layout">
      <Sidebar
        links={ADMIN_LINKS}
        role={ROLES.ADMIN}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="main-content">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main style={{ flex: 1, overflowY: "auto", background: "var(--color-bg)" }}>
          <div style={{ padding: "1.5rem 2rem", maxWidth: 1400, margin: "0 auto" }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <ToastProvider>
      <AdminLayoutInner />
    </ToastProvider>
  );
}