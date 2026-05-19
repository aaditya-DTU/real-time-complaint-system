import Complaint from "../models/Complaint.model.js";
import { calculateSlaDeadline } from "./sla.service.js";
import { COMPLAINT_STATUS, VALID_TRANSITIONS } from "../utils/constants.js";
import { logAudit } from "./audit.service.js";
import { getIO } from "../config/socket.js";

export const createComplaintService = async ({
  title,
  description,
  type,
  priority,
  department,
  user
}) => {
  const slaDeadline = calculateSlaDeadline(type);

  const complaint = await Complaint.create({
    title,
    description,
    type,
    priority,
    department,
    createdBy: user.userId,
    status: COMPLAINT_STATUS.SUBMITTED,
    slaDeadline,
    statusHistory: [
      {
        status: COMPLAINT_STATUS.SUBMITTED,
        changedBy: user.userId,
        remarks: "Complaint created"
      }
    ]
  });

  return complaint;
};

export const assignComplaintService = async ({
  complaintId,
  staffId,
  performedBy
}) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw new Error("Complaint not found");

  const previousAssignee = complaint.assignedTo;

  complaint.assignedTo = staffId;
  complaint.status = COMPLAINT_STATUS.ASSIGNED;

  complaint.statusHistory.push({
    status: COMPLAINT_STATUS.ASSIGNED,
    changedBy: performedBy,
    remarks: "Complaint assigned to staff"
  });

  await complaint.save();

  const io = getIO();

  // Notify assigned staff via their personal room
  io.to(staffId.toString()).emit("complaint:assigned", {
    complaintId: complaint._id,
    title: complaint.title,
    message: "New complaint assigned to you"
  });

  // Notify dashboard listeners
  io.emit("dashboard:refresh");

  await logAudit({
    entityType: "COMPLAINT",
    entityId: complaint._id,
    action: "ASSIGNED_TO_STAFF",
    performedBy,
    metadata: { staffId, previousAssignee }
  });

  return complaint;
};

export const updateStatusService = async ({
  complaintId,
  newStatus,
  remarks,
  user
}) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw new Error("Complaint not found");

  // 🔒 Escalated complaints locked for STAFF
  if (
    complaint.status === COMPLAINT_STATUS.ESCALATED &&
    user.role === "STAFF"
  ) {
    throw new Error("Escalated complaints cannot be updated by staff");
  }

  // 🔐 Only the assigned staff member (admins/HOD bypass)
  if (
    user.role === "STAFF" &&
    complaint.assignedTo?.toString() !== user.userId
  ) {
    throw new Error("Not authorized to update this complaint");
  }

  // 🔁 Validate FSM transition
  const allowed = VALID_TRANSITIONS[complaint.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Invalid transition: ${complaint.status} → ${newStatus}`
    );
  }

  if (complaint.status === newStatus) {
    throw new Error("Status is already set to that value");
  }

  const previousStatus = complaint.status;

  // ✅ Apply update
  complaint.status = newStatus;

  // Set resolvedAt timestamp when resolved
  if (newStatus === COMPLAINT_STATUS.RESOLVED) {
    complaint.resolvedAt = new Date();
  }

  complaint.statusHistory.push({
    status: newStatus,
    previousStatus,
    changedBy: user.userId,
    remarks: remarks || undefined
  });

  await complaint.save();

  const io = getIO();

  // Notify the student who created the complaint
  io.to(complaint.createdBy.toString()).emit("complaint:updated", {
    _id: complaint._id,
    status: newStatus,
    title: complaint.title
  });

  // Notify admin/HOD dashboard
  io.emit("dashboard:refresh");

  await logAudit({
    entityType: "COMPLAINT",
    entityId: complaint._id,
    action: `STATUS_CHANGED_TO_${newStatus}`,
    performedBy: user.userId,
    metadata: { previousStatus, newStatus, remarks }
  });

  return complaint;
};