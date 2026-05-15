const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db.cjs");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev_only";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

function isStrongPassword(password) {
  if (!password || typeof password !== "string") return false;

  const hasMinLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);

  return hasMinLength && hasLetter && hasNumber;
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      account_type: user.account_type,
      institute: user.institute || null,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      institute,
      city,
      grade,
      institute_code,
      account_type,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        error: "Name, email, password, and role are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Please enter a valid email address",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long and include at least one letter and one number",
      });
    }

    if (!["student", "guide", "admin"].includes(role)) {
      return res.status(400).json({
        error: "Invalid role selected",
      });
    }

    const finalAccountType = account_type || "institute";

    if (!["individual", "institute"].includes(finalAccountType)) {
      return res.status(400).json({
        error: "Invalid account type",
      });
    }

    if (finalAccountType === "individual" && role !== "student") {
      return res.status(400).json({
        error: "Only students can create individual accounts",
      });
    }

    if (finalAccountType === "institute" && !institute) {
      return res.status(400).json({
        error: "Institute name is required for institute accounts",
      });
    }

    if (
      finalAccountType === "institute" &&
      (role === "guide" || role === "admin") &&
      !institute_code
    ) {
      return res.status(400).json({
        error: "Institute code is required for guides and admins",
      });
    }

    const [existing] = await db.promise().query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.promise().query(
      `
      INSERT INTO users 
      (name, email, password, role, institute, city, grade, institute_code, account_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name.trim(),
        email.toLowerCase().trim(),
        hashedPassword,
        role,
        finalAccountType === "individual" ? null : institute,
        city || null,
        grade || null,
        institute_code || null,
        finalAccountType,
      ]
    );

    res.status(201).json({
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Signup backend error:", error);
    res.status(500).json({
      error: "Signup failed",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: "Please enter a valid email address",
      });
    }

    const [users] = await db.promise().query(
      `
      SELECT 
        id, name, email, password, role, institute, city, grade, institute_code, account_type
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const user = users[0];

    let passwordMatched = false;

    const looksHashed =
      typeof user.password === "string" &&
      (user.password.startsWith("$2a$") ||
        user.password.startsWith("$2b$") ||
        user.password.startsWith("$2y$"));

    if (looksHashed) {
      passwordMatched = await bcrypt.compare(password, user.password);
    } else {
      passwordMatched = user.password === password;

      if (passwordMatched) {
        const newHashedPassword = await bcrypt.hash(password, 10);

        await db.promise().query(
          "UPDATE users SET password = ? WHERE id = ?",
          [newHashedPassword, user.id]
        );
      }
    }

    if (!passwordMatched) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      institute: user.institute,
      city: user.city,
      grade: user.grade,
      institute_code: user.institute_code,
      account_type: user.account_type || "institute",
    };

    const token = createToken(safeUser);

    res.json({
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("Login backend error:", error);
    res.status(500).json({
      error: "Login failed",
    });
  }
});

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    const [users] = await db.promise().query(
      `
      SELECT 
        id, name, email, role, institute, city, grade, institute_code, account_type
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      user: users[0],
    });
  } catch (error) {
    console.error("Auth me error:", error);
    res.status(401).json({
      error: "Invalid or expired token",
    });
  }
});

module.exports = router;