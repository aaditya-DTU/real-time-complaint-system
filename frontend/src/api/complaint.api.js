import api from "./axios";

// ── Complaint API ──────────────────────────────────────────

/**
 * Create a new complaint.
 */
export const createComplaint = async (data) => {
  const res = await api.post("/complaints", data);
  return res.data;
};

/**
 * Get complaints created by the current student.
 * @param {object} params - { status, type, priority, page, limit }
 */
export const getMyComplaints = async (params = {}) => {
  const res = await api.get("/complaints/my", { params });
  return res.data;
};

/**
 * Get a single complaint by ID.
 */
export const getComplaintById = async (id) => {
  const res = await api.get(`/complaints/${id}`);
  return res.data;
};

/**
 * Get complaints assigned to the current staff member.
 * @param {object} params - { status, priority, page, limit }
 */
export const getAssignedComplaints = async (params = {}) => {
  const res = await api.get("/complaints/assigned", { params });
  return res.data;
};

/**
 * Update complaint status (staff/HOD action).
 * @param {string} id
 * @param {string} status  - new status value
 * @param {string} remarks - optional remarks
 */
export const updateComplaintStatus = async (id, status, remarks = "") => {
  const res = await api.patch(`/complaints/${id}/status`, { status, remarks });
  return res.data;
};

/**
 * Add a remark/comment to a complaint without changing status.
 */
export const addRemark = async (id, remark) => {
  const res = await api.post(`/complaints/${id}/remarks`, { remark });
  return res.data;
};

/**
 * Get escalation history for a complaint.
 */
export const getEscalationHistory = async (id) => {
  const res = await api.get(`/complaints/${id}/escalations`);
  return res.data;
};

/**
 * Get audit trail for a complaint.
 */
export const getAuditLog = async (id) => {
  const res = await api.get(`/complaints/${id}/audit`);
  return res.data;
};

// ── Summary / Dashboard ────────────────────────────────────

/**
 * Student dashboard summary: counts by status.
 */
export const getMyComplaintSummary = async () => {
  const res = await api.get("/complaints/my/summary");
  return res.data;
};

/**
 * Staff dashboard summary: assigned, in-progress, resolved, escalated.
 */
export const getStaffComplaintSummary = async () => {
  const res = await api.get("/complaints/assigned/summary");
  return res.data;
};

/**
 * Admin dashboard: full system metrics.
 */
export const getAdminDashboard = async () => {
  const res = await api.get("/admin/dashboard");
  return res.data;
};

// ── Filters & Search ───────────────────────────────────────

/**
 * Search complaints (admin/HOD).
 * @param {object} params - { q, status, type, priority, department, page, limit, sortBy, order }
 */
export const searchComplaints = async (params = {}) => {
  const res = await api.get("/complaints", { params });
  return res.data;
};

/**
 * Get breached (SLA-overdue) complaints.
 */
export const getBreachedComplaints = async (params = {}) => {
  const res = await api.get("/complaints/breached", { params });
  return res.data;
};

/**
 * Get escalated complaints (admin/HOD).
 */
export const getEscalatedComplaints = async (params = {}) => {
  const res = await api.get("/complaints/escalated", { params });
  return res.data;
};

/**
 * Get resolved complaints with resolution metrics.
 */
export const getResolvedComplaints = async (params = {}) => {
  const res = await api.get("/complaints/resolved", { params });
  return res.data;
};

export const closeComplaint = async (id, remarks = "Complaint closed") => {
  const res = await api.patch(`/complaints/${id}/close`, { remarks });
  return res.data;
};