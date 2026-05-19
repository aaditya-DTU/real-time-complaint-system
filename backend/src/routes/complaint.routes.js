import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import rbacMiddleware from "../middlewares/rbac.middleware.js";
import { createComplaint,
        assignComplaint,
        updateComplaintStatus,
        getMyComplaints,
        getComplaintById,
        getAssignedComplaints,
        getMyComplaintSummary,
        getAssignedComplaintSummary,
        getAdminDashboard,
        getEscalatedComplaints,
        getResolvedComplaints,
        getStaffDashboard,
        getComplaintTimeline,
        closeComplaint
 } from "../controllers/complaint.controller.js";
import { validateCreateComplaint } from "../validators/complaint.validator.js";
import { ROLES } from "../utils/constants.js";


const router = express.Router();

// Student creates complaint
router.post(
  "/",
  authMiddleware,
  rbacMiddleware(ROLES.STUDENT),
  validateCreateComplaint,
  createComplaint
);

router.get(
  "/my",
  authMiddleware,
  rbacMiddleware(ROLES.STUDENT),
  getMyComplaints
);

router.get(
  "/my/summary",
  authMiddleware,
  rbacMiddleware(ROLES.STUDENT),
  getMyComplaintSummary
);

router.get(
  "/assigned/summary",
  authMiddleware,
  rbacMiddleware(ROLES.STAFF),
  getAssignedComplaintSummary
);

router.get(
  "/admin/dashboard",
  authMiddleware,
  rbacMiddleware(ROLES.ADMIN, ROLES.HOD),
  getAdminDashboard
);

// Staff assigns complaint
router.get(
  "/staff/dashboard",
  authMiddleware,
  rbacMiddleware(ROLES.STAFF),
  getStaffDashboard
);

router.get(
  "/assigned",
  authMiddleware,
  rbacMiddleware(ROLES.STAFF),
  getAssignedComplaints
);

router.get(
  "/escalated",
  authMiddleware,
  rbacMiddleware(ROLES.STAFF),
  getEscalatedComplaints
);

router.get(
  "/resolved",
  authMiddleware,
  rbacMiddleware(ROLES.STAFF),
  getResolvedComplaints
);


router.get(
  "/:id/timeline",
  authMiddleware,
  getComplaintTimeline
);

router.put(
  "/:id/assign",
  authMiddleware,
  rbacMiddleware(ROLES.ADMIN, ROLES.HOD),
  assignComplaint
);

// Staff updates status
router.patch(
  "/:id/status",
  authMiddleware,
  rbacMiddleware(ROLES.STAFF),
  updateComplaintStatus
);

router.patch(
  "/:id/close",
  authMiddleware,
  rbacMiddleware(ROLES.STAFF, ROLES.ADMIN, ROLES.HOD),
  closeComplaint
);

router.get(
  "/:id",
  authMiddleware,
  getComplaintById
);

export default router;
