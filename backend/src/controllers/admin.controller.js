import Complaint from "../models/Complaint.model.js";
import SLA from "../models/Sla.model.js";
import User from "../models/User.model.js";
import EscalationRule from "../models/EscalationRule.model.js";
import { SLA_RULES, COMPLAINT_STATUS } from "../utils/constants.js";


export const getAllComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find()
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    next(error);
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    const total        = await Complaint.countDocuments();
    const unassigned   = await Complaint.countDocuments({ assignedTo: null });
    const slaBreached  = await Complaint.countDocuments({ status: COMPLAINT_STATUS.ESCALATED });
    const resolvedToday = await Complaint.countDocuments({
      status: COMPLAINT_STATUS.RESOLVED,
      updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    const unassignedList = await Complaint.find({ assignedTo: null })
      .sort({ createdAt: -1 }).limit(5);

    const breachedList = await Complaint.find({ status: COMPLAINT_STATUS.ESCALATED })
      .sort({ createdAt: -1 }).limit(5);

    res.status(200).json({ total, unassigned, slaBreached, resolvedToday, unassignedList, breachedList });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ message: "Failed to load admin dashboard" });
  }
};

export const getSlaConfig = async (req, res) => {
  const dbSla  = await SLA.find();
  const merged = Object.entries(SLA_RULES).map(([category, hours]) => {
    const override = dbSla.find((s) => s.category === category);
    return { category, hours: override ? override.hours : hours };
  });
  res.json(merged);
};

export const updateSlaConfig = async (req, res) => {
  const { category, hours } = req.body;
  const sla = await SLA.findOneAndUpdate({ category }, { hours }, { new: true, upsert: true });
  res.json(sla);
};

export const getEscalationRules = async (req, res) => {
  const rules  = await EscalationRule.find();
  const merged = Object.keys(SLA_RULES).map((category) => {
    const rule = rules.find((r) => r.category === category);
    return { category, escalateTo: rule?.escalateTo || "HOD", enabled: rule?.enabled ?? true };
  });
  res.json(merged);
};

export const updateEscalationRule = async (req, res) => {
  const { category, escalateTo, enabled } = req.body;
  const rule = await EscalationRule.findOneAndUpdate(
    { category }, { escalateTo, enabled }, { new: true, upsert: true }
  );
  res.json(rule);
};

export const getAdminReports = async (req, res) => {
  try {
    const [byCategory, byStatus, slaBreached, total] = await Promise.all([
      Complaint.aggregate([{ $group: { _id: "$category", total: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: "$status",   total: { $sum: 1 } } }]),
      Complaint.countDocuments({ status: COMPLAINT_STATUS.ESCALATED }),
      Complaint.countDocuments(),
    ]);
    res.json({ total, slaBreached, byCategory, byStatus });
  } catch (error) {
    console.error("Reports error:", error);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};

/**
 * ASSIGN COMPLAINT TO STAFF
 * PATCH /api/admin/complaints/:id/assign
 *
 * ✅ BUG FIX: previously used hardcoded lowercase string "assigned".
 * Mongoose enum stores "ASSIGNED" (uppercase via COMPLAINT_STATUS constant).
 * Staff query filters by COMPLAINT_STATUS.ASSIGNED — so with the wrong case
 * the complaint was saved but never matched, making it invisible to staff.
 */
export const assignComplaintToStaff = async (req, res) => {
  try {
    const { staffId }   = req.body;
    const complaintId   = req.params.id;

    const staff = await User.findById(staffId);
    if (!staff || staff.role !== "STAFF") {
      return res.status(400).json({ message: "Invalid staff member" });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.assignedTo = staffId;
    complaint.status     = COMPLAINT_STATUS.ASSIGNED; // ✅ was: "assigned"
    complaint.statusHistory.push({
      status:    COMPLAINT_STATUS.ASSIGNED,
      changedBy: req.user.userId,
      remarks:   "Assigned by admin",
    });

    await complaint.save();
    res.json({ message: "Complaint assigned successfully", complaint });
  } catch (error) {
    console.error("Assign error:", error);
    res.status(500).json({ message: "Failed to assign complaint" });
  }
};

export const getStaffList = async (req, res) => {
  try {
    const staff = await User.find({ role: "STAFF" }, "name email");
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch staff list" });
  }
};

/**
 * GET ESCALATED COMPLAINTS (ADMIN)
 * GET /api/admin/complaints/escalated
 */
export const getEscalatedComplaintsAdmin = async (req, res) => {
  try {
    const complaints = await Complaint.find({ status: COMPLAINT_STATUS.ESCALATED })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ updatedAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error("Escalated complaints error:", error);
    res.status(500).json({ message: "Failed to fetch escalated complaints" });
  }
};

/**
 * HANDLE ESCALATED COMPLAINT — RESOLVE or REASSIGN
 * PATCH /api/admin/complaints/:id/escalated
 */
export const handleEscalatedComplaint = async (req, res) => {
  try {
    const { action, staffId, remarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    if (complaint.status !== COMPLAINT_STATUS.ESCALATED)
      return res.status(400).json({ message: "Complaint is not escalated" });

    if (action === "REASSIGN") {
      if (!staffId) return res.status(400).json({ message: "Staff ID required" });
      complaint.assignedTo = staffId;
      complaint.status     = COMPLAINT_STATUS.ASSIGNED;
      complaint.escalated  = false;
      complaint.statusHistory.push({
        status: COMPLAINT_STATUS.ASSIGNED, changedBy: req.user.userId,
        remarks: remarks || "Reassigned by admin",
      });
    }

    if (action === "RESOLVE") {
      complaint.status     = COMPLAINT_STATUS.RESOLVED;
      complaint.escalated  = false;
      complaint.resolvedAt = new Date();
      complaint.statusHistory.push({
        status: COMPLAINT_STATUS.RESOLVED, changedBy: req.user.userId,
        remarks: remarks || "Resolved by admin",
      });
    }

    await complaint.save();
    res.json({ message: "Escalated complaint handled", complaint });
  } catch (error) {
    console.error("Handle escalated error:", error);
    res.status(500).json({ message: "Failed to handle escalated complaint" });
  }
};

/**
 * FORCE CLOSE COMPLAINT
 * PATCH /api/admin/complaints/:id/close
 */
export const forceCloseComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    if (complaint.status === COMPLAINT_STATUS.CLOSED)
      return res.status(400).json({ message: "Complaint is already closed" });

    complaint.status    = COMPLAINT_STATUS.CLOSED;
    complaint.escalated = false;
    complaint.statusHistory.push({
      status: COMPLAINT_STATUS.CLOSED, changedBy: req.user.userId,
      remarks: req.body.reason || "Force closed by admin",
    });

    await complaint.save();
    res.json({ message: "Complaint force closed", complaint });
  } catch (error) {
    console.error("Force close error:", error);
    res.status(500).json({ message: "Failed to force close complaint" });
  }
};