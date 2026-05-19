import { PRIORITY, COMPLAINT_STATUS } from "./constants";

// ── Priority Colors ────────────────────────────────────────
// Returns Tailwind classes OR CSS variable values

const PRIORITY_CONFIG = {
  [PRIORITY.CRITICAL]: {
    dot:        "priority-critical",
    text:       "text-red-400",
    bg:         "bg-red-500/10",
    border:     "border-red-500/20",
    badge:      "badge-escalated",
    hex:        "#ef4444",
    label:      "Critical",
    pulse:      true,
  },
  [PRIORITY.HIGH]: {
    dot:        "priority-high",
    text:       "text-orange-400",
    bg:         "bg-orange-500/10",
    border:     "border-orange-500/20",
    badge:      "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    hex:        "#f97316",
    label:      "High",
    pulse:      false,
  },
  [PRIORITY.MEDIUM]: {
    dot:        "priority-medium",
    text:       "text-amber-400",
    bg:         "bg-amber-500/10",
    border:     "border-amber-500/20",
    badge:      "badge-inprogress",
    hex:        "#f59e0b",
    label:      "Medium",
    pulse:      false,
  },
  [PRIORITY.LOW]: {
    dot:        "priority-low",
    text:       "text-green-400",
    bg:         "bg-green-500/10",
    border:     "border-green-500/20",
    badge:      "badge-resolved",
    hex:        "#22c55e",
    label:      "Low",
    pulse:      false,
  },
};

// ── Status Colors ──────────────────────────────────────────

const STATUS_CONFIG = {
  [COMPLAINT_STATUS.SUBMITTED]: {
    badge:  "badge-submitted",
    text:   "text-blue-400",
    bg:     "bg-blue-500/10",
    border: "border-blue-500/20",
    hex:    "#3b82f6",
    icon:   "⏳",
  },
  [COMPLAINT_STATUS.ASSIGNED]: {
    badge:  "badge-assigned",
    text:   "text-purple-400",
    bg:     "bg-purple-500/10",
    border: "border-purple-500/20",
    hex:    "#a855f7",
    icon:   "👤",
  },
  [COMPLAINT_STATUS.IN_PROGRESS]: {
    badge:  "badge-inprogress",
    text:   "text-amber-400",
    bg:     "bg-amber-500/10",
    border: "border-amber-500/20",
    hex:    "#f59e0b",
    icon:   "🔄",
  },
  [COMPLAINT_STATUS.RESOLVED]: {
    badge:  "badge-resolved",
    text:   "text-green-400",
    bg:     "bg-green-500/10",
    border: "border-green-500/20",
    hex:    "#22c55e",
    icon:   "✅",
  },
  [COMPLAINT_STATUS.CLOSED]: {
    badge:  "badge-closed",
    text:   "text-slate-400",
    bg:     "bg-slate-500/10",
    border: "border-slate-500/20",
    hex:    "#64748b",
    icon:   "🔒",
  },
  [COMPLAINT_STATUS.ESCALATED]: {
    badge:  "badge-escalated",
    text:   "text-red-400",
    bg:     "bg-red-500/10",
    border: "border-red-500/20",
    hex:    "#ef4444",
    icon:   "🚨",
  },
};

// ── Public API ─────────────────────────────────────────────

/**
 * Get the full config object for a priority.
 * Falls back gracefully for unknown values.
 */
export const getPriorityConfig = (priority) =>
  PRIORITY_CONFIG[priority?.toUpperCase()] ?? PRIORITY_CONFIG[PRIORITY.MEDIUM];

/**
 * Get the full config object for a status.
 */
export const getStatusConfig = (status) =>
  STATUS_CONFIG[status?.toUpperCase()] ?? STATUS_CONFIG[COMPLAINT_STATUS.SUBMITTED];

// Convenience shorthands
export const getPriorityColor  = (p) => getPriorityConfig(p).hex;
export const getPriorityText   = (p) => getPriorityConfig(p).text;
export const getPriorityBadge  = (p) => getPriorityConfig(p).badge;
export const getPriorityDot    = (p) => getPriorityConfig(p).dot;
export const getPriorityLabel  = (p) => getPriorityConfig(p).label;
export const getPriorityPulse  = (p) => getPriorityConfig(p).pulse;

export const getStatusColor    = (s) => getStatusConfig(s).hex;
export const getStatusText     = (s) => getStatusConfig(s).text;
export const getStatusBadge    = (s) => getStatusConfig(s).badge;
export const getStatusIcon     = (s) => getStatusConfig(s).icon;
export const getStatusBg       = (s) => getStatusConfig(s).bg;

/**
 * Returns a CSS-variable-friendly inline style object for chart use.
 */
export const getPriorityStyle = (priority) => ({
  color:           getPriorityColor(priority),
  backgroundColor: `${getPriorityColor(priority)}1a`, // 10% opacity
  borderColor:     `${getPriorityColor(priority)}33`,  // 20% opacity
});

export const getStatusStyle = (status) => ({
  color:           getStatusColor(status),
  backgroundColor: `${getStatusColor(status)}1a`,
  borderColor:     `${getStatusColor(status)}33`,
});

/**
 * Chart.js-compatible color arrays for a list of priority/status values.
 */
export const getPriorityChartColors = (priorities = []) =>
  priorities.map(getPriorityColor);

export const getStatusChartColors = (statuses = []) =>
  statuses.map(getStatusColor);

// Ordered arrays for consistent chart rendering
export const PRIORITY_ORDER = [
  PRIORITY.CRITICAL,
  PRIORITY.HIGH,
  PRIORITY.MEDIUM,
  PRIORITY.LOW,
];

export const STATUS_ORDER_LIST = [
  COMPLAINT_STATUS.SUBMITTED,
  COMPLAINT_STATUS.ASSIGNED,
  COMPLAINT_STATUS.IN_PROGRESS,
  COMPLAINT_STATUS.ESCALATED,
  COMPLAINT_STATUS.RESOLVED,
  COMPLAINT_STATUS.CLOSED,
];

export const PRIORITY_CHART_PALETTE = PRIORITY_ORDER.map(getPriorityColor);
export const STATUS_CHART_PALETTE   = STATUS_ORDER_LIST.map(getStatusColor);