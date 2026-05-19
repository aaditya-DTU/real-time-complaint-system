import { useCallback, useEffect, useRef, useState } from "react";
import {
  getSLARemaining,
  getSLAPercent,
  getSLAStatus,
  formatSLACountdown,
} from "../utils/formatDate";
import { SLA_RULES, SLA_BY_PRIORITY, APP_CONFIG } from "../utils/constants";

// ── useSLA ─────────────────────────────────────────────────
export const useSLA = ({
  createdAt,
  type,
  priority,
  slaHours: explicitHours,
  resolved  = false,
  closed    = false,   // ✅ NEW: freeze bar + show "Closed" label
} = {}) => {
  const slaHours =
    explicitHours ??
    (priority ? SLA_BY_PRIORITY[priority?.toUpperCase()] : null) ??
    (type     ? SLA_RULES[type?.toUpperCase()]            : null) ??
    48;

  // ── Frozen state for closed complaints ──────────────────
  // When closed, we freeze at the breach/elapsed state but
  // replace the label with "Closed" so the bar stops animating.
  const isFrozen = resolved || closed;

  const compute = useCallback(() => {
    if (!createdAt) {
      return {
        label:      "No deadline",
        status:     "safe",
        percent:    0,
        remaining:  null,
        slaHours,
        isBreached: false,
        isWarning:  false,
        isClosed:   closed,
      };
    }

    const remaining = getSLARemaining(createdAt, slaHours);
    const percent   = getSLAPercent(createdAt, slaHours);
    const status    = getSLAStatus(createdAt, slaHours);

    // For closed complaints: freeze label, stop pulsing
    const label = closed
      ? "Closed"
      : formatSLACountdown(createdAt, slaHours);

    return {
      label,
      status,
      percent:    Math.min(percent, 100),
      remaining,
      slaHours,
      isBreached: !closed && status === "breach",  // no pulse when closed
      isWarning:  !closed && status === "warning",
      isClosed:   closed,
    };
  }, [createdAt, slaHours, closed]);

  const [sla, setSla] = useState(compute);

  useEffect(() => {
    // Don't tick if frozen (resolved or closed) or no date
    if (isFrozen || !createdAt) {
      setSla(compute()); // compute once to get frozen snapshot
      return;
    }

    setSla(compute());

    const timer = setInterval(() => {
      const next = compute();
      setSla(next);
      if (next.isBreached) clearInterval(timer);
    }, APP_CONFIG.SLA_CHECK_MS);

    return () => clearInterval(timer);
  }, [compute, isFrozen, createdAt]);

  return sla;
};

// ── useSLAList ─────────────────────────────────────────────
export const useSLAList = (complaints = []) => {
  const computeAll = useCallback(() => {
    const map = {};
    for (const c of complaints) {
      if (!c._id || !c.createdAt) continue;

      const isClosed = c.status === "CLOSED";

      const slaHours =
        (c.priority ? SLA_BY_PRIORITY[c.priority?.toUpperCase()] : null) ??
        (c.type     ? SLA_RULES[c.type?.toUpperCase()]            : null) ??
        48;

      const status = getSLAStatus(c.createdAt, slaHours);

      map[c._id] = {
        slaHours,
        remaining:  getSLARemaining(c.createdAt, slaHours),
        percent:    Math.min(getSLAPercent(c.createdAt, slaHours), 100),
        status,
        label:      isClosed ? "Closed" : formatSLACountdown(c.createdAt, slaHours),
        isBreached: !isClosed && status === "breach",
        isWarning:  !isClosed && status === "warning",
        isClosed,
      };
    }
    return map;
  }, [complaints]);

  const [slaMap, setSlaMap] = useState(computeAll);

  useEffect(() => {
    setSlaMap(computeAll());
    const timer = setInterval(() => setSlaMap(computeAll()), APP_CONFIG.SLA_CHECK_MS);
    return () => clearInterval(timer);
  }, [computeAll]);

  return slaMap;
};

// ── useSLADeadline ─────────────────────────────────────────
export const useSLADeadline = (createdAt, slaHours) => {
  if (!createdAt || !slaHours) return null;
  return new Date(new Date(createdAt).getTime() + slaHours * 60 * 60 * 1000);
};

export default useSLA;