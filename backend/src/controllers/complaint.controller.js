import {
  createComplaintService,
  assignComplaintService,
  updateStatusService
} from "../services/complaint.service.js";
import Complaint from "../models/Complaint.model.js";
import { getIO } from "../config/socket.js";
import { COMPLAINT_STATUS } from "../utils/constants.js";


export const createComplaint = async (req, res, next) => {
  try {
    const complaint = await createComplaintService({ ...req.body, user: req.user });
    res.status(201).json({ message: "Complaint created successfully", complaint });
  } catch (error) {
    next(error);
  }
};

export const assignComplaint = async (req, res, next) => {
  try {
    const { staffId } = req.body;
    const complaint   = await assignComplaintService({
      complaintId: req.params.id,
      staffId,
      performedBy: req.user.userId,
    });

    // ✅ service already emits to staffId room + dashboard:refresh
    // do NOT double-emit globally here — it was broadcasting to all users

    res.json({ message: "Complaint assigned successfully", complaint });
  } catch (error) {
    next(error);
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const complaint = await updateStatusService({
      complaintId: req.params.id,
      newStatus:   req.body.status,
      remarks:     req.body.remarks,
      user:        req.user,
    });
    res.json({ message: "Status updated successfully", complaint });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// ── Student ────────────────────────────────────────────────

export const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    next(error);
  }
};

export const getMyComplaintSummary = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [total, open, resolved, breached, recent] = await Promise.all([
      Complaint.countDocuments({ createdBy: userId }),
      Complaint.countDocuments({
        createdBy: userId,
        status: { $in: [COMPLAINT_STATUS.SUBMITTED, COMPLAINT_STATUS.ASSIGNED, COMPLAINT_STATUS.IN_PROGRESS] },
      }),
      Complaint.countDocuments({ createdBy: userId, status: COMPLAINT_STATUS.RESOLVED }),
      Complaint.countDocuments({ createdBy: userId, status: COMPLAINT_STATUS.ESCALATED }),
      Complaint.find({ createdBy: userId })
        .sort({ createdAt: -1 }).limit(5)
        .select("title status createdAt priority type slaDeadline"),
    ]);

    res.json({ total, open, resolved, breached, recent });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch summary" });
  }
};


// ── Staff ──────────────────────────────────────────────────

/**
 * GET /api/complaints/assigned
 *
 * ✅ BUG FIX: previously only queried ASSIGNED + IN_PROGRESS.
 * ESCALATED complaints are still assigned to staff — excluding them
 * made those complaints disappear from the staff view entirely.
 * Now includes all active (non-terminal) statuses for the staff member.
 */
export const getAssignedComplaints = async (req, res) => {
  try {
    const staffId = req.user.userId;

    const complaints = await Complaint.find({
      assignedTo: staffId,
      status: {
        $in: [
          COMPLAINT_STATUS.ASSIGNED,
          COMPLAINT_STATUS.IN_PROGRESS,
          COMPLAINT_STATUS.ESCALATED, // ✅ FIX: was missing — escalated complaints vanished from staff view
        ],
      },
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name");

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assigned complaints" });
  }
};

/**
 * GET /api/complaints/assigned/summary
 */
export const getAssignedComplaintSummary = async (req, res) => {
  try {
    const staffId = req.user.userId;

    const [assigned, inProgress, escalated, resolved] = await Promise.all([
      Complaint.countDocuments({ assignedTo: staffId }),
      Complaint.countDocuments({ assignedTo: staffId, status: COMPLAINT_STATUS.IN_PROGRESS }),
      Complaint.countDocuments({ assignedTo: staffId, status: COMPLAINT_STATUS.ESCALATED }),
      Complaint.countDocuments({
        assignedTo: staffId,
        status: { $in: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED] },
      }),
    ]);

    res.json({ assigned, inProgress, escalated, resolved });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch staff summary" });
  }
};

/**
 * GET /api/complaints/staff/dashboard
 */
export const getStaffDashboard = async (req, res) => {
  try {
    const staffId = req.user.userId;

    const [assigned, inProgress, escalated, resolved, urgent] = await Promise.all([
      Complaint.countDocuments({ assignedTo: staffId, status: COMPLAINT_STATUS.ASSIGNED }),
      Complaint.countDocuments({ assignedTo: staffId, status: COMPLAINT_STATUS.IN_PROGRESS }),
      Complaint.countDocuments({ assignedTo: staffId, status: COMPLAINT_STATUS.ESCALATED }),
      Complaint.countDocuments({
        assignedTo: staffId,
        status: { $in: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED] },
      }),
      Complaint.find({
        assignedTo: staffId,
        status: { $nin: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED] },
      })
        .select("title type status priority createdAt slaDeadline")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.json({ assigned, inProgress, escalated, resolved, urgent });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch staff dashboard" });
  }
};

/**
 * GET /api/complaints/escalated
 */
export const getEscalatedComplaints = async (req, res) => {
  try {
    const staffId   = req.user.userId;
    const complaints = await Complaint.find({
      assignedTo: staffId,
      status:     COMPLAINT_STATUS.ESCALATED,
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name");

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch escalated complaints" });
  }
};

/**
 * GET /api/complaints/resolved
 */
export const getResolvedComplaints = async (req, res) => {
  try {
    const staffId   = req.user.userId;
    const complaints = await Complaint.find({
      assignedTo: staffId,
      status:     { $in: [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.CLOSED] },
    })
      .sort({ updatedAt: -1 })
      .populate("createdBy", "name");

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch resolved complaints" });
  }
};


// ── Admin ──────────────────────────────────────────────────

export const getAdminDashboard = async (req, res) => {
  try {
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

    const [total, unassigned, slaBreached, resolvedToday, unassignedList, breachedList] =
      await Promise.all([
        Complaint.countDocuments(),
        Complaint.countDocuments({ assignedTo: null }),
        Complaint.countDocuments({ status: COMPLAINT_STATUS.ESCALATED }),
        Complaint.countDocuments({ status: COMPLAINT_STATUS.RESOLVED, updatedAt: { $gte: todayStart } }),
        Complaint.find({ assignedTo: null })
          .sort({ createdAt: -1 }).limit(5)
          .select("title department priority createdAt"),
        Complaint.find({ status: COMPLAINT_STATUS.ESCALATED })
          .sort({ createdAt: -1 }).limit(5)
          .select("title department priority createdAt"),
      ]);

    res.status(200).json({ total, unassigned, slaBreached, resolvedToday, unassignedList, breachedList });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admin dashboard" });
  }
};


// ── Shared ─────────────────────────────────────────────────

export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("createdBy",              "name role")
      .populate("assignedTo",             "name role")
      .populate("statusHistory.changedBy","name role");

    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    const isOwner    = complaint.createdBy?._id.toString() === req.user.userId;
    const isAssigned = complaint.assignedTo?._id.toString() === req.user.userId;
    const isElevated = ["ADMIN", "HOD"].includes(req.user.role);

    if (!isOwner && !isAssigned && !isElevated)
      return res.status(403).json({ message: "Access denied" });

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch complaint" });
  }
};

export const getComplaintTimeline = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("statusHistory.changedBy", "name role");

    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    const isOwner    = complaint.createdBy.toString() === req.user.userId;
    const isAssigned = complaint.assignedTo?.toString() === req.user.userId;
    const isElevated = ["ADMIN", "HOD"].includes(req.user.role);

    if (!isOwner && !isAssigned && !isElevated)
      return res.status(403).json({ message: "Access denied" });

    res.json(complaint.statusHistory);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch timeline" });
  }
};

export const closeComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    if (complaint.status !== "RESOLVED") {
      return res.status(400).json({ message: "Only resolved complaints can be closed" });
    }

    complaint.status = "CLOSED";
    complaint.statusHistory.push({
      status: "CLOSED",
      changedBy: req.user.userId,
      remarks: req.body.remarks || "Complaint closed"
    });

    await complaint.save();
    res.json({ message: "Complaint closed", complaint });
  } catch (error) {
    res.status(500).json({ message: "Failed to close complaint" });
  }
};