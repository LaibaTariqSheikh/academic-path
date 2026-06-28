require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3001",
    ],
    credentials: true,
  })
);

app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.status(200).send("Backend running 🚀");
});

// Routes
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

// Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start Server
const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});