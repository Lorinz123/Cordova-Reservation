import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import healthRouter from "./routes/health.routes.js";
import barangayRouter from "./routes/barangay.routes.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import equipmentRouter from "./routes/equipment.routes.js";
import adminInvitationRouter from "./routes/admin-invitation.routes.js";
import reservationRouter from "./routes/reservation.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import residentRouter from "./routes/resident.routes.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 7000;

// Security middleware
app.use(helmet());

// Allow requests from the frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Parse incoming JSON
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false, limit: "2kb" }));

app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/health", healthRouter);
app.use("/api/barangays", barangayRouter);
app.use("/api/equipment", equipmentRouter);
app.use("/api/admin-invitations", adminInvitationRouter);
app.use("/api/reservations", reservationRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/residents", residentRouter);

// Test endpoint
app.get("/", (_req, res) => {
  res.json({
    message: "Cordova Reservation Portal API is running!",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
