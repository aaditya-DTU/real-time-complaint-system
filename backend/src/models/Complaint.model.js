import mongoose from "mongoose";
import {
  COMPLAINT_STATUS,
  COMPLAINT_TYPES
} from "../utils/constants.js";

const statusHistorySchema = new mongoose.Schema(
  {
    status: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    remarks: String
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: Object.values(COMPLAINT_TYPES),
      required: true
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM"
    },
    department: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: Object.values(COMPLAINT_STATUS),
      default: COMPLAINT_STATUS.SUBMITTED
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    slaDeadline: {
      type: Date,
      required: true
    },
    // ✅ ADDED: populated by complaint.service.js when status → RESOLVED
    resolvedAt: {
      type: Date,
      default: null
    },
    escalationLevel: {
      type: Number,
      default: 0
    },
    escalated: {
      type: Boolean,
      default: false
    },
    statusHistory: [statusHistorySchema]
  },
  { timestamps: true }
);

complaintSchema.index({ status: 1 });
complaintSchema.index({ slaDeadline: 1 });
complaintSchema.index({ assignedTo: 1 });

export default mongoose.model("Complaint", complaintSchema);