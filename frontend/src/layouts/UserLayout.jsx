import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import { ToastProvider, useToast } from "../components/common/Toast";
import { onComplaintUpdated, onNotification } from "../utils/socket";
import { ROLES } from "../utils/constants";

const USER_LINKS = [
  { section: "Overview" },
  { to: "/user",            label: "Dashboard",        icon: "📊", end: true },
  { section: "Complaints" },
  { to: "/user/complaints", label: "My Complaints",    icon: "📂" },
  { to: "/user/submit",     label: "Submit Complaint", icon: "✍️" },
];

// ── Inner layout (needs toast context) ────────────────────
function UserLayoutInner() {
  const toast   = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const unsub1 = onComplaintUpdated((data) => {
      toast.success(`Complaint "${data.title ?? "update"}" → ${data.status}`);
    });
    const unsub2 = onNotification((n) => {
      toast.info(n.message ?? String(n));
    });
    return () => { unsub1(); unsub2(); };
  }, [toast]);

  return (
    <div className="app-layout">
      <Sidebar
        links={USER_LINKS}
        role={ROLES.STUDENT}
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

export default function UserLayout() {
  return (
    <ToastProvider>
      <UserLayoutInner />
    </ToastProvider>
  );
}