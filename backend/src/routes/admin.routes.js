import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import rbacMiddleware from "../middlewares/rbac.middleware.js";
import { ROLES } from "../utils/constants.js";
import { getAllComplaints, 
        getAdminDashboard, 
        getSlaConfig, 
        updateSlaConfig,
        getEscalationRules,
        updateEscalationRule,
        getAdminReports,
        assignComplaintToStaff,
        getStaffList,
        getEscalatedComplaintsAdmin,
        handleEscalatedComplaint
        } from "../controllers/admin.controller.js";


const router = Router();

// Admin Dashboard Summary
router.get(
  "/dashboard",
  authMiddleware,
  rbacMiddleware(ROLES.ADMIN),
  getAdminDashboard
);

// Get All Complaints
router.get(
  "/complaints",
  authMiddleware,
  rbacMiddleware(ROLES.ADMIN),
  getAllComplaints
);

// Get Staff List
router.get(
  "/staff",
  authMiddleware,
  rbacMiddleware(ROLES.ADMIN),
  getStaffList
);

// Get SLA Configuration
router.get(
  "/sla",
  authMiddleware,
  rbacMiddleware(ROLES.ADMIN),
  getSlaConfig
);

// Update SLA Configuration
router.put(
  "/sla",
  authMiddleware,
  rbacMiddleware(ROLES.ADMIN),
  updateSlaConfig
);

// Get Escalation Rules
router.get(
  "/escalation-rules",  
  authMiddleware,
  rbacMiddleware(ROLES.ADMIN),
  getEscalationRules
);

// Update Escalation Rules
router.put(
  "/escalation-rules",
  authMiddleware,
  rbacMiddleware(ROLES.ADMIN),
  updateEscalationRule
);

// Get Admin Reports
router.get(
  "/reports",
  authMiddleware,
  rbacMiddleware(ROLES.ADMIN),
  getAdminReports
);

router.get(
  "/complaints/escalated",
  authMiddleware,
  rbacMiddleware(ROLES.ADMIN),
  getEscalatedComplaintsAdmin
);

router.patch(
  "/complaints/:id/escalated",
  authMiddleware,
  rbacMiddleware(ROLES.ADMIN),
  handleEscalatedComplaint
);

// Assign Complaint to Staff
router.patch(
  "/complaints/:id/assign",
  authMiddleware,
  rbacMiddleware(ROLES.ADMIN),
  assignComplaintToStaff
);


export default router; // ✅ THIS LINE FIXES EVERYTHING
