import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";
import adminRoutes from "./routes/admin.routes.js";


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);


// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server running" });
});

export default app;
