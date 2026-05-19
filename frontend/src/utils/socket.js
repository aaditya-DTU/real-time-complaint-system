import { io } from "socket.io-client";
import { APP_CONFIG, SOCKET_EVENTS, STORAGE_KEYS } from "./constants";

// ── Socket Instance ────────────────────────────────────────

export const socket = io(APP_CONFIG.SOCKET_URL, {
  autoConnect:        false,
  reconnection:       true,
  reconnectionDelay:  1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 10,
  timeout:            10_000,
  transports:         ["websocket", "polling"],
});

// ── Connection Helpers ─────────────────────────────────────

/**
 * Connect and authenticate the socket with the stored JWT.
 */
export const connectSocket = (token) => {
  const t = token || localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (!t) {
    console.warn("[socket] No token — skipping connect");
    return;
  }
  if (socket.connected) return;

  socket.auth = { token: t };
  socket.connect();
};

/**
 * Disconnect and clean up.
 */
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// ── Room Management ────────────────────────────────────────

/**
 * Join a room for targeted updates.
 * @param {"user"|"admin"|"staff"|string} room
 */
export const joinRoom = (room) => {
  if (socket.connected) {
    socket.emit(SOCKET_EVENTS.JOIN_ROOM, room);
  }
};

export const leaveRoom = (room) => {
  if (socket.connected) {
    socket.emit(SOCKET_EVENTS.LEAVE_ROOM, room);
  }
};

// ── Event Subscription Helpers ─────────────────────────────

/**
 * Subscribe to complaint updates.
 * @param {function} cb - (complaint) => void
 */
export const onComplaintUpdated = (cb) => {
  socket.on(SOCKET_EVENTS.COMPLAINT_UPDATED, cb);
  return () => socket.off(SOCKET_EVENTS.COMPLAINT_UPDATED, cb);
};

/**
 * Subscribe to escalation events.
 */
export const onComplaintEscalated = (cb) => {
  socket.on(SOCKET_EVENTS.COMPLAINT_ESCALATED, cb);
  return () => socket.off(SOCKET_EVENTS.COMPLAINT_ESCALATED, cb);
};

/**
 * Subscribe to SLA breach notifications.
 */
export const onSLABreached = (cb) => {
  socket.on(SOCKET_EVENTS.SLA_BREACHED, cb);
  return () => socket.off(SOCKET_EVENTS.SLA_BREACHED, cb);
};

/**
 * Subscribe to generic notifications.
 */
export const onNotification = (cb) => {
  socket.on(SOCKET_EVENTS.NOTIFICATION, cb);
  return () => socket.off(SOCKET_EVENTS.NOTIFICATION, cb);
};

/**
 * Subscribe to dashboard refresh triggers.
 */
export const onDashboardRefresh = (cb) => {
  socket.on(SOCKET_EVENTS.DASHBOARD_REFRESH, cb);
  return () => socket.off(SOCKET_EVENTS.DASHBOARD_REFRESH, cb);
};

// ── Debug Listeners (dev only) ─────────────────────────────

if (import.meta.env.DEV) {
  socket.on("connect",           ()  => console.log("[socket] Connected:", socket.id));
  socket.on("disconnect",        (r) => console.log("[socket] Disconnected:", r));
  socket.on("connect_error",     (e) => console.warn("[socket] Error:", e.message));
  socket.on("reconnect_attempt", (n) => console.log("[socket] Reconnecting attempt", n));
  socket.on("reconnect",         (n) => console.log("[socket] Reconnected after", n, "attempts"));
}

export default socket;