import api from "./axios";

// ── Complaints ─────────────────────────────────────────────

/**
 * Get all complaints with optional filters.
 * @param {object} params - { status, type, priority, department, page, limit, sortBy, order }
 */
export const getAllComplaints = async (params = {}) => {
  const res = await api.get("/admin/complaints", { params });
  // Handle both array and wrapped response
  return res.data?.complaints ?? res.data ?? [];
};

/**
 * Get escalated complaints.
 */
export const getEscalatedComplaints = async (params = {}) => {
  const res = await api.get("/admin/complaints/escalated", { params });
  // Handle both array and wrapped response
  return res.data?.complaints ?? res.data ?? [];
};

/**
 * Get SLA-breached complaints.
 */
export const getBreachedComplaints = async (params = {}) => {
  const res = await api.get("/admin/complaints/breached", { params });
  return res.data;
};

/**
 * Assign a complaint to a staff member.
 */
export const assignComplaint = async (complaintId, staffId) => {
  const res = await api.patch(`/admin/complaints/${complaintId}/assign`, { staffId });
  return res.data;
};

/**
 * Force-close a complaint (admin override).
 */
export const forceCloseComplaint = async (complaintId, reason) => {
  const res = await api.patch(`/admin/complaints/${complaintId}/close`, { reason });
  return res.data;
};

// ── Staff Management ───────────────────────────────────────

/**
 * Get list of all staff members.
 * @param {object} params - { department, available }
 */
export const getStaffList = async (params = {}) => {
  const res = await api.get("/admin/staff", { params });
  return res.data;
};

/**
 * Get staff workload/performance metrics.
 */
export const getStaffMetrics = async (staffId) => {
  const url = staffId ? `/admin/staff/${staffId}/metrics` : "/admin/staff/metrics";
  const res = await api.get(url);
  return res.data;
};

// ── SLA Config ─────────────────────────────────────────────

/**
 * Get current SLA configuration rules.
 */
export const getSLAConfig = async () => {
  const res = await api.get("/admin/sla-config");
  return res.data;
};

/**
 * Update SLA rules.
 * @param {object} rules - { HOSTEL: 24, ACADEMIC: 48, ... }
 */
export const updateSLAConfig = async (rules) => {
  const res = await api.put("/admin/sla-config", rules);
  return res.data;
};

// ── Escalation Rules ───────────────────────────────────────

/**
 * Get all escalation rules.
 */
export const getEscalationRules = async () => {
  const res = await api.get("/admin/escalation-rules");
  return res.data;
};

/**
 * Create a new escalation rule.
 */
export const createEscalationRule = async (data) => {
  const res = await api.post("/admin/escalation-rules", data);
  return res.data;
};

/**
 * Update an escalation rule.
 */
export const updateEscalationRule = async (ruleId, data) => {
  const res = await api.patch(`/admin/escalation-rules/${ruleId}`, data);
  return res.data;
};

/**
 * Delete an escalation rule.
 */
export const deleteEscalationRule = async (ruleId) => {
  const res = await api.delete(`/admin/escalation-rules/${ruleId}`);
  return res.data;
};

// ── Reports & Analytics ────────────────────────────────────

/**
 * Get admin dashboard summary metrics.
 */
export const getAdminDashboard = async () => {
  const res = await api.get("/admin/dashboard");
  return res.data;
};

/**
 * Get detailed analytics / report data.
 * @param {object} params - { from, to, groupBy, type, department }
 */
export const getReports = async (params = {}) => {
  const res = await api.get("/admin/reports", { params });
  return res.data;
};

/**
 * Export complaints as CSV/Excel.
 * @param {object} params - filter params
 */
export const exportComplaints = async (params = {}) => {
  const res = await api.get("/admin/reports/export", {
    params,
    responseType: "blob",
  });
  return res.data;
};

/**
 * Get SLA performance metrics (breach rate, avg resolution, etc.)
 */
export const getSLAMetrics = async (params = {}) => {
  const res = await api.get("/admin/metrics/sla", { params });
  return res.data;
};

/**
 * Get complaint trend data for charts.
 * @param {object} params - { days: 30 }
 */
export const getComplaintTrends = async (params = { days: 30 }) => {
  const res = await api.get("/admin/metrics/trends", { params });
  return res.data;
};