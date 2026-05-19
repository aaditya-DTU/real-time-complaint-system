import mongoose from "mongoose";

const escalationRuleSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      unique: true,
    },
    escalateTo: {
      type: String,
      enum: ["HOD", "ADMIN"],
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("EscalationRule", escalationRuleSchema);
