require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Backend running 🚀");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend is healthy",
  });
});

const authRoutes = require("./routes/auth.cjs");
const questionnaireRoutes = require("./routes/questionnaire.cjs");
const guideRoutes = require("./routes/guide.cjs");
const adminRoutes = require("./routes/admin.cjs");
const notificationRoutes = require("./routes/notifications.cjs");

app.use("/api/auth", authRoutes);
app.use("/api/questionnaire", questionnaireRoutes);
app.use("/api/guide", guideRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({
    error: "Internal server error",
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});