require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.status(200).send("Backend running 🚀");
});

// Test API
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend is healthy",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: "Internal Server Error",
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});