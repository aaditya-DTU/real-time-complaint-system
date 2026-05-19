import { SLA_THRESHOLD } from "./constants";

// ── Core Formatters ────────────────────────────────────────

/**
 * Format a date to a human-readable string.
 * @param {string|Date} date
 * @param {object} options - Intl.DateTimeFormat options
 */
export const formatDate = (date, options = {}) => {
  if (!date) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day:   "2-digit",
      month: "short",
      year:  "numeric",
      ...options,
    }).format(new Date(date));
  } catch {
    return "Invalid date";
  }
};

/**
 * Format date + time.
 */
export const formatDateTime = (date) => {
  if (!date) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day:    "2-digit",
      month:  "short",
      year:   "numeric",
      hour:   "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  } catch {
    return "Invalid date";
  }
};

/**
 * Format time only.
 */
export const formatTime = (date) => {
  if (!date) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      hour:   "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  } catch {
    return "Invalid date";
  }
};

// ── Relative Time ──────────────────────────────────────────

const UNITS = [
  { label: "year",   ms: 365 * 24 * 60 * 60 * 1000 },
  { label: "month",  ms: 30  * 24 * 60 * 60 * 1000 },
  { label: "week",   ms: 7   * 24 * 60 * 60 * 1000 },
  { label: "day",    ms: 24  * 60 * 60 * 1000 },
  { label: "hour",   ms: 60  * 60 * 1000 },
  { label: "minute", ms: 60  * 1000 },
  { label: "second", ms: 1000 },
];

/**
 * "2 hours ago", "just now", "in 3 days"
 */
export const timeAgo = (date) => {
  if (!date) return "—";
  try {
    const diff = Date.now() - new Date(date).getTime();
    const abs  = Math.abs(diff);
    const past = diff > 0;

    if (abs < 10_000) return "just now";

    for (const { label, ms } of UNITS) {
      const val = Math.floor(abs / ms);
      if (val >= 1) {
        const str = `${val} ${label}${val !== 1 ? "s" : ""}`;
        return past ? `${str} ago` : `in ${str}`;
      }
    }
    return "just now";
  } catch {
    return "—";
  }
};

/**
 * Short version: "2h ago", "3d ago"
 */
export const timeAgoShort = (date) => {
  if (!date) return "—";
  try {
    const diff = Date.now() - new Date(date).getTime();
    const abs  = Math.abs(diff);
    const past = diff > 0;

    if (abs < 60_000) return "now";

    const shortcuts = [
      { unit: "y", ms: 365 * 24 * 60 * 60 * 1000 },
      { unit: "mo", ms: 30 * 24 * 60 * 60 * 1000 },
      { unit: "w",  ms: 7  * 24 * 60 * 60 * 1000 },
      { unit: "d",  ms: 24 * 60 * 60 * 1000 },
      { unit: "h",  ms: 60 * 60 * 1000 },
      { unit: "m",  ms: 60 * 1000 },
    ];

    for (const { unit, ms } of shortcuts) {
      const val = Math.floor(abs / ms);
      if (val >= 1) {
        return past ? `${val}${unit} ago` : `in ${val}${unit}`;
      }
    }
    return "now";
  } catch {
    return "—";
  }
};

// ── SLA Helpers ────────────────────────────────────────────

/**
 * Returns ms remaining until SLA deadline.
 * Negative means breached.
 */
export const getSLARemaining = (createdAt, slaHours) => {
  if (!createdAt || slaHours == null) return null;
  const deadline = new Date(createdAt).getTime() + slaHours * 60 * 60 * 1000;
  return deadline - Date.now();
};

/**
 * Returns % of SLA time elapsed (0–100+).
 */
export const getSLAPercent = (createdAt, slaHours) => {
  if (!createdAt || !slaHours) return 0;
  const total   = slaHours * 60 * 60 * 1000;
  const elapsed = Date.now() - new Date(createdAt).getTime();
  return Math.round((elapsed / total) * 100);
};

/**
 * "warning" | "breach" | "safe"
 */
export const getSLAStatus = (createdAt, slaHours) => {
  const pct = getSLAPercent(createdAt, slaHours);
  if (pct >= SLA_THRESHOLD.BREACH)  return "breach";
  if (pct >= SLA_THRESHOLD.WARNING) return "warning";
  return "safe";
};

/**
 * Human-readable SLA countdown: "4h 32m remaining" | "Breached 2h ago"
 */
export const formatSLACountdown = (createdAt, slaHours) => {
  const remaining = getSLARemaining(createdAt, slaHours);
  if (remaining == null) return "—";

  const abs = Math.abs(remaining);
  const h   = Math.floor(abs / (60 * 60 * 1000));
  const m   = Math.floor((abs % (60 * 60 * 1000)) / 60_000);

  if (abs < 60_000) {
    return remaining > 0 ? "< 1m remaining" : "Just breached";
  }

  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  const str = parts.join(" ");

  return remaining > 0
    ? `${str} remaining`
    : `Breached ${str} ago`;
};

// ── Duration Formatter ─────────────────────────────────────

/**
 * "2d 4h 30m" from ms
 */
export const formatDuration = (ms) => {
  if (!ms || ms < 0) return "—";
  const d = Math.floor(ms / (24 * 60 * 60 * 1000));
  const h = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const m = Math.floor((ms % (60 * 60 * 1000)) / 60_000);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m || !parts.length) parts.push(`${m}m`);
  return parts.join(" ");
};

/**
 * Resolution time between two dates
 */
export const getResolutionTime = (createdAt, resolvedAt) => {
  if (!createdAt || !resolvedAt) return null;
  return formatDuration(new Date(resolvedAt) - new Date(createdAt));
};

// ── Date Range ─────────────────────────────────────────────

export const isToday = (date) => {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  return d.getDate() === now.getDate() &&
         d.getMonth() === now.getMonth() &&
         d.getFullYear() === now.getFullYear();
};

export const isThisWeek = (date) => {
  if (!date) return false;
  const d    = new Date(date).getTime();
  const now  = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  return now - d < week;
};

/**
 * Returns ISO date string "YYYY-MM-DD"
 */
export const toISODate = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};