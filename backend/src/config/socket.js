import { Server } from "socket.io";

let io;

/**
 * Initialize Socket.IO with HTTP server
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    socket.on("join", (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`👤 User joined room: ${userId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  return io;
};

/**
 * Get active Socket.IO instance
 * (used by jobs / services)
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

/**
 * Emit event to a specific user (room-based)
 */
export const emitToUser = (userId, event, payload) => {
  if (!io) {
    console.warn("⚠️ Socket not initialized");
    return;
  }

  io.to(userId).emit(event, payload);
};
