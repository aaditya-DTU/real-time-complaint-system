import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import { ToastProvider, useToast } from "../components/common/Toast";
import { onComplaintUpdated, onComplaintEscalated, onNotification } from "../utils/socket";
import { ROLES } from "../utils/constants";

const STAFF_LINKS = [
  { section: "Overview" },
  { to: "/staff",           label: "Dashboard",  icon: "📊", end: true },
  { section: "Complaints" },
  { to: "/staff/assigned",  label: "Assigned",   icon: "📋" },
  { to: "/staff/escalated", label: "Escalated",  icon: "🚨" },
  { to: "/staff/resolved",  label: "Resolved",   icon: "✅" },
  { to: "/staff/closed",    label: "Closed",     icon: "🔒" },  // ✅ NEW
];

function StaffLayoutInner() {
  const toast = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const unsub1 = onComplaintUpdated((data) => {
      if (data.status === "ASSIGNED") {
        toast.info(`📌 New complaint assigned: ${data.title ?? ""}`);
      }
    });
    const unsub2 = onComplaintEscalated((data) => {
      toast.error(`Complaint escalated: ${data.title ?? data._id?.slice(-6)}`);
    });
    const unsub3 = onNotification((n) => {
      toast.info(n.message ?? String(n));
    });
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [toast]);

  return (
    <div className="app-layout">
      <Sidebar
        links={STAFF_LINKS}
        role={ROLES.STAFF}
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

export default function StaffLayout() {
  return (
    <ToastProvider>
      <StaffLayoutInner />
    </ToastProvider>
  );
}