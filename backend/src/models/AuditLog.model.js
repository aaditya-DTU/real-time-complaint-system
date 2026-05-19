import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      required: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    metadata: Object
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
