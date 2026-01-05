
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { connectDB } from "./src/config/database.js";
import { errorHandler } from "./src/middleware/errorHandler.js";

import authRoutes from "./src/routes/authRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";
import chatUploadRoutes from "./src/routes/chatUpload.route.js"; // New route
import userRoutes from "./src/routes/userRoutes.js";

import vocabRoutes from "./src/routes/vocabRoutes.js";
import feedbackRoutes from "./src/routes/feedbackRoutes.js";
import listeningRoutes from "./src/routes/listeningRoutes.js";
import aiConfigRoutes from "./src/routes/aiConfigRoutes.js";

dotenv.config();

await import("./src/config/passport.js");

const app = express();

// Kết nối cơ sở dữ liệu
connectDB();

// Middleware bảo mật
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Giới hạn tốc độ truy cập (Rate limiting)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // giới hạn mỗi IP 100 lượt request mỗi windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/", limiter);

// Nén phản hồi
app.use(compression());

// CORS
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));

// Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Passport
app.use(passport.initialize());

// File tĩnh
app.use("/uploads", express.static("uploads"));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat/upload", chatUploadRoutes); // Nên đặt trước /api/chat để tránh lỗi route khớp
// Express khớp route tuần tự. Nếu cẩn thận thì đặt route cụ thể trước route chung.
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);

app.use("/api/vocabulary", vocabRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/listening", listeningRoutes);
app.use("/api/ai-config", aiConfigRoutes);

// Kiểm tra trạng thái hệ thống
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// Endpoint gốc
app.get("/", (req, res) => {
  res.json({
    message: "English Learning API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      chat: "/api/chat",
      users: "/api/users",
      voice: "/api/voice",
      files: "/api/files",
      vocabulary: "/api/vocabulary",
      health: "/api/health",
    },
  });
});

// Xử lý lỗi 404 (Không tìm thấy)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Xử lý lỗi chung
app.use(errorHandler);

// Tắt server an toàn (Graceful shutdown)
const gracefulShutdown = () => {
  console.log("\n Received shutdown signal, closing server gracefully...");

  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log(` Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(` API URL: http://localhost:${PORT}`);
  console.log(` Docs: http://localhost:${PORT}/`);
  console.log("=".repeat(50));
});
