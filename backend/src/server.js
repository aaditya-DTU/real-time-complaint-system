import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./config/socket.js";
import startSlaChecker from "./jobs/slaChecker.job.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1️⃣ Connect to MongoDB
    await connectDB();

    // 2️⃣ Create HTTP server
    const server = http.createServer(app);

    // 3️⃣ Initialize Socket.IO
    initSocket(server);

    // 4️⃣ Start SLA cron job
    startSlaChecker();

    // 5️⃣ Start listening
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
