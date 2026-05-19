import mongoose from "mongoose";

const slaSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      unique: true,
    },
    hours: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("SLA", slaSchema);
