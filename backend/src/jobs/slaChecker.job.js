import cron from "node-cron";
import Complaint from "../models/Complaint.model.js";
import User from "../models/User.model.js";
import { COMPLAINT_STATUS } from "../utils/constants.js";
import { logAudit } from "../services/audit.service.js";
import { SYSTEM_USER_ID } from "../utils/fsm.js";

const startSlaChecker = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log("⏱️ SLA checker running...");

      const now = new Date();

      // Find admin (escalation owner)
      const admin = await User.findOne({ role: "ADMIN" });

      if (!admin) {
        console.error("❌ No ADMIN found for escalation");
        return;
      }

      const breachedComplaints = await Complaint.find({
        slaDeadline: { $lt: now },
        status: {
          $nin: [
            COMPLAINT_STATUS.RESOLVED,
            COMPLAINT_STATUS.CLOSED,
            COMPLAINT_STATUS.ESCALATED
          ]
        },
        escalated: false
      });

      for (const complaint of breachedComplaints) {
        complaint.status = COMPLAINT_STATUS.ESCALATED;
        complaint.escalated = true;
        complaint.escalationLevel += 1;

        // 🔴 REASSIGN OWNERSHIP
        complaint.assignedTo = admin._id;

        // 🧾 TIMELINE ENTRY
        complaint.statusHistory.push({
          status: COMPLAINT_STATUS.ESCALATED,
          changedBy: null,
          remarks: "Auto-escalated due to SLA breach"
        });

        await complaint.save();

        // 🧾 AUDIT LOG
        await logAudit({
          entityType: "COMPLAINT",
          entityId: complaint._id,
          action: "AUTO_ESCALATED",
          performedBy: SYSTEM_USER_ID,
          metadata: {
            escalationLevel: complaint.escalationLevel
          }
        });

        console.log(
          `🚨 Complaint ${complaint._id} escalated to ADMIN`
        );
      }
    } catch (error) {
      console.error(
        "SLA checker error:",
        error.message
      );
    }
  });
};

export default startSlaChecker;
