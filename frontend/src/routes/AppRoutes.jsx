import { Routes, Route, Navigate } from "react-router-dom";

// ── Auth pages ─────────────────────────────────────────────
import Landing  from "../pages/auth/Landing";
import Login    from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AuthLayout from "../layouts/AuthLayout";

// ── Layouts ────────────────────────────────────────────────
import UserLayout    from "../layouts/UserLayout";
import StaffLayout   from "../layouts/StaffLayout";
import ManagerLayout from "../layouts/ManagerLayout";
import AdminLayout   from "../layouts/AdminLayout";

// ── User (Student) pages ───────────────────────────────────
import UserDashboard    from "../pages/user/UserDashboard";
import MyComplaints     from "../pages/user/MyComplaints";
import SubmitComplaint  from "../pages/user/SubmitComplaint";
import ComplaintTimeline from "../pages/user/ComplaintTimeline";

// ── Staff pages ────────────────────────────────────────────
import StaffDashboard      from "../pages/staff/StaffDashboard";
import AssignedComplaints  from "../pages/staff/AssignedComplaints";
import EscalatedComplaints from "../pages/staff/EscalatedComplaints";
import ResolvedComplaints  from "../pages/staff/ResolvedComplaints";
import UpdateStatus        from "../pages/staff/UpdateStatus";
import ClosedComplaints from "../pages/staff/ClosedComplaints";

// ── Manager (HOD) pages ────────────────────────────────────
import Metrics from "../pages/manager/Metrics";

// ── Admin pages ────────────────────────────────────────────
import AdminDashboard  from "../pages/admin/AdminDashboard";
import AllComplaints   from "../pages/admin/AllComplaints";
import BreachedComplaints from "../pages/admin/BreachedComplaints";
import EscalationRules from "../pages/admin/EscalationRules";
import Reports         from "../pages/admin/Reports";
import SLAConfig       from "../pages/admin/SLAConfig";

// ── Guards ─────────────────────────────────────────────────
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute      from "./RoleRoute";
import { ROLES }      from "../utils/constants";

// ── 404 page ───────────────────────────────────────────────
import NotFound from "./NotFound";

const AppRoutes = () => (
  <Routes>

    {/* ── Public / Auth routes ─────────────────────────── */}
    <Route path="/" element={<Landing />} />

    <Route element={<AuthLayout />}>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Route>

    {/* ── Protected routes (token required) ───────────── */}
    <Route element={<ProtectedRoute />}>

      {/* Student */}
      <Route element={<RoleRoute role={ROLES.STUDENT} />}>
        <Route path="/user" element={<UserLayout />}>
          <Route index                    element={<UserDashboard />} />
          <Route path="complaints"        element={<MyComplaints />} />
          <Route path="complaints/:id"    element={<ComplaintTimeline />} />
          <Route path="submit"            element={<SubmitComplaint />} />
        </Route>
      </Route>

      {/* Staff */}
      <Route element={<RoleRoute role={ROLES.STAFF} />}>
        <Route path="/staff" element={<StaffLayout />}>
          <Route index                    element={<StaffDashboard />} />
          <Route path="assigned"          element={<AssignedComplaints />} />
          <Route path="escalated"         element={<EscalatedComplaints />} />
          <Route path="resolved"          element={<ResolvedComplaints />} />
          <Route path="closed"            element={<ClosedComplaints />} />
          <Route path="complaints/:id"    element={<ComplaintTimeline />} />
          <Route path="update/:id"        element={<UpdateStatus />} />
        </Route>
      </Route>

      {/* Manager / HOD */}
      <Route element={<RoleRoute role={ROLES.HOD} />}>
        <Route path="/manager" element={<ManagerLayout />}>
          <Route index                    element={<Metrics />} />
          {/* HOD can also view complaints and reports */}
          <Route path="complaints"        element={<AllComplaints />} />
          <Route path="complaints/:id"    element={<ComplaintTimeline />} />
          <Route path="escalated"         element={<EscalatedComplaints />} />
          <Route path="breached"          element={<BreachedComplaints />} />
          <Route path="reports"           element={<Reports />} />
        </Route>
      </Route>

      {/* Admin */}
      <Route element={<RoleRoute role={ROLES.ADMIN} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index                    element={<AdminDashboard />} />
          <Route path="complaints"        element={<AllComplaints />} />
          <Route path="complaints/:id"    element={<ComplaintTimeline />} />
          <Route path="escalated"         element={<BreachedComplaints />} />
          <Route path="escalation-rules"  element={<EscalationRules />} />
          <Route path="sla"               element={<SLAConfig />} />
          <Route path="reports"           element={<Reports />} />
        </Route>
      </Route>

    </Route>

    {/* ── 404 / fallback ──────────────────────────────── */}
    <Route path="*" element={<NotFound />} />

  </Routes>
);

export default AppRoutes;