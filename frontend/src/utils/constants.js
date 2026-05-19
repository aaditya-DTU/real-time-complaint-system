// ── Roles ─────────────────────────────────────────────────
export const ROLES = {
  STUDENT:  "STUDENT",
  STAFF:    "STAFF",
  HOD:      "HOD",
  ADMIN:    "ADMIN",
};

export const ROLE_LABELS = {
  STUDENT: "Student",
  STAFF:   "Staff",
  HOD:     "Head of Department",
  ADMIN:   "Administrator",
};

// ── Complaint Status ───────────────────────────────────────
export const COMPLAINT_STATUS = {
  SUBMITTED:   "SUBMITTED",
  ASSIGNED:    "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED:    "RESOLVED",
  CLOSED:      "CLOSED",
  ESCALATED:   "ESCALATED",
};

export const STATUS_LABELS = {
  SUBMITTED:   "Submitted",
  ASSIGNED:    "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED:    "Resolved",
  CLOSED:      "Closed",
  ESCALATED:   "Escalated",
};

// Order for progress display (0 = start, higher = further along)
export const STATUS_ORDER = {
  SUBMITTED:   0,
  ASSIGNED:    1,
  IN_PROGRESS: 2,
  RESOLVED:    3,
  CLOSED:      4,
  ESCALATED:   2, // parallel track
};

// ── Valid Status Transitions ───────────────────────────────
export const VALID_TRANSITIONS = {
  SUBMITTED:   ["ASSIGNED"],
  ASSIGNED:    ["IN_PROGRESS", "ESCALATED"],
  IN_PROGRESS: ["RESOLVED", "ESCALATED"],
  RESOLVED:    ["CLOSED"],
  CLOSED:      [],
  ESCALATED:   ["IN_PROGRESS"],
};

// ── Complaint Types ────────────────────────────────────────
export const COMPLAINT_TYPES = {
  HOSTEL:      "HOSTEL",
  ACADEMIC:    "ACADEMIC",
  EXAM:        "EXAM",
  HARASSMENT:  "HARASSMENT",
};

export const COMPLAINT_TYPE_LABELS = {
  HOSTEL:     "Hostel",
  ACADEMIC:   "Academic",
  EXAM:       "Examination",
  HARASSMENT: "Harassment",
};

// ── Priority ───────────────────────────────────────────────
export const PRIORITY = {
  LOW:      "LOW",
  MEDIUM:   "MEDIUM",
  HIGH:     "HIGH",
  CRITICAL: "CRITICAL",
};

export const PRIORITY_LABELS = {
  LOW:      "Low",
  MEDIUM:   "Medium",
  HIGH:     "High",
  CRITICAL: "Critical",
};

// Type → default priority mapping
export const TYPE_PRIORITY_MAP = {
  HOSTEL:     "MEDIUM",
  ACADEMIC:   "MEDIUM",
  EXAM:       "HIGH",
  HARASSMENT: "CRITICAL",
};

// ── SLA Rules (hours) ──────────────────────────────────────
export const SLA_RULES = {
  HOSTEL:     24,
  ACADEMIC:   48,
  EXAM:       72,
  HARASSMENT:  0,   // immediate / real-time
};

// Priority-based SLA overrides (hours; lower = faster required)
export const SLA_BY_PRIORITY = {
  CRITICAL: 2,
  HIGH:     12,
  MEDIUM:   48,
  LOW:      72,
};

// SLA thresholds for UI warnings (% of time elapsed)
export const SLA_THRESHOLD = {
  WARNING: 75,   // yellow warning above 75%
  BREACH:  100,  // red breached at/above 100%
};

// ── Socket Events ──────────────────────────────────────────
export const SOCKET_EVENTS = {
  // Server → Client
  COMPLAINT_UPDATED:    "complaint:updated",
  COMPLAINT_ESCALATED:  "complaint:escalated",
  SLA_BREACHED:         "sla:breached",
  NOTIFICATION:         "notification",
  DASHBOARD_REFRESH:    "dashboard:refresh",

  // Client → Server
  JOIN_ROOM:    "join:room",
  LEAVE_ROOM:   "leave:room",
};

// ── API Pagination Defaults ────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT:     100,
};

// ── Local Storage Keys ─────────────────────────────────────
export const STORAGE_KEYS = {
  TOKEN:       "rtcs_token",
  USER:        "rtcs_user",
  THEME:       "rtcs_theme",
};

// ── App Config ─────────────────────────────────────────────
export const APP_CONFIG = {
  NAME:            "RTCS",
  FULL_NAME:       "Real-Time Complaint Escalation System",
  VERSION:         "1.0.0",
  API_BASE_URL:    import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  SOCKET_URL:      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
  POLL_INTERVAL:   30_000,    // 30s dashboard polling fallback
  SLA_CHECK_MS:    60_000,    // 1min SLA clock tick
};