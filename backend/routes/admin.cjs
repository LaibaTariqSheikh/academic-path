const express = require("express");
const db = require("../config/db.cjs");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware.js");

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole("admin"));

router.get("/users/:institute", async (req, res) => {
  try {
    const { institute } = req.params;

    if (req.user.institute !== institute) {
      return res.status(403).json({
        error: "You can only view users from your own institute",
      });
    }

    const [users] = await db.promise().query(
      `
      SELECT 
        id, name, email, role, institute, city, grade, institute_code, account_type
      FROM users
      WHERE institute = ?
        AND account_type = 'institute'
      ORDER BY role, name
      `,
      [institute]
    );

    res.json(users);
  } catch (error) {
    console.error("Admin users fetch error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/guides/:institute", async (req, res) => {
  try {
    const { institute } = req.params;

    if (req.user.institute !== institute) {
      return res.status(403).json({
        error: "You can only view guides from your own institute",
      });
    }

    const [guides] = await db.promise().query(
      `
      SELECT id, name, email, institute, account_type
      FROM users
      WHERE institute = ?
        AND role = 'guide'
        AND account_type = 'institute'
      ORDER BY name
      `,
      [institute]
    );

    res.json(guides);
  } catch (error) {
    console.error("Admin guides fetch error:", error);
    res.status(500).json({ error: "Failed to fetch guides" });
  }
});

router.post("/assign-guide", async (req, res) => {
  try {
    const { student_id, guide_id } = req.body;

    if (!student_id || !guide_id) {
      return res.status(400).json({
        error: "student_id and guide_id are required",
      });
    }

    const [studentRows] = await db.promise().query(
      `
      SELECT id, name, institute, account_type, role
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [student_id]
    );

    const [guideRows] = await db.promise().query(
      `
      SELECT id, name, institute, account_type, role
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [guide_id]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (guideRows.length === 0) {
      return res.status(404).json({ error: "Guide not found" });
    }

    const student = studentRows[0];
    const guide = guideRows[0];

    if (student.role !== "student") {
      return res.status(400).json({ error: "Selected user is not a student" });
    }

    if (guide.role !== "guide") {
      return res.status(400).json({ error: "Selected user is not a guide" });
    }

    if (student.account_type !== "institute") {
      return res.status(400).json({
        error: "Individual students cannot be assigned institute guides",
      });
    }

    if (guide.account_type !== "institute") {
      return res.status(400).json({
        error: "Only institute guides can be assigned",
      });
    }

    if (student.institute !== guide.institute) {
      return res.status(400).json({
        error: "Student and guide must belong to the same institute",
      });
    }

    if (student.institute !== req.user.institute) {
      return res.status(403).json({
        error: "You can only assign guides within your own institute",
      });
    }

    await db.promise().query(
      `
      INSERT INTO guide_assignments (student_id, guide_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE guide_id = VALUES(guide_id)
      `,
      [student_id, guide_id]
    );

    await db.promise().query(
      `
      INSERT INTO notifications (user_id, title, message)
      VALUES (?, ?, ?)
      `,
      [
        student_id,
        "Guide Assigned",
        `${guide.name} has been assigned to support you.`,
      ]
    );

    await db.promise().query(
      `
      INSERT INTO notifications (user_id, title, message)
      VALUES (?, ?, ?)
      `,
      [guide_id, "Student Assigned", `${student.name} has been assigned to you.`]
    );

    await db.promise().query(
      `
      INSERT INTO notifications (user_id, title, message)
      VALUES (?, ?, ?)
      `,
      [
        req.user.id,
        "Guide Assignment Successful",
        `Guide ${guide.name} was assigned to ${student.name}.`,
      ]
    );

    res.json({ message: "Guide assigned successfully" });
  } catch (error) {
    console.error("Assign guide error:", error);
    res.status(500).json({ error: "Failed to assign guide" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [userRows] = await db.promise().query(
      `
      SELECT id, institute
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userRows[0].institute !== req.user.institute) {
      return res.status(403).json({
        error: "You can only delete users from your own institute",
      });
    }

    await db.promise().query("DELETE FROM users WHERE id = ?", [id]);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Admin delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

router.get("/analytics/:institute", async (req, res) => {
  try {
    const { institute } = req.params;

    if (req.user.institute !== institute) {
      return res.status(403).json({
        error: "You can only view analytics from your own institute",
      });
    }

    const [students] = await db.promise().query(
      `
      SELECT COUNT(*) AS count 
      FROM users 
      WHERE institute = ? 
        AND role = 'student'
        AND account_type = 'institute'
      `,
      [institute]
    );

    const [guides] = await db.promise().query(
      `
      SELECT COUNT(*) AS count 
      FROM users 
      WHERE institute = ? 
        AND role = 'guide'
        AND account_type = 'institute'
      `,
      [institute]
    );

    const [admins] = await db.promise().query(
      `
      SELECT COUNT(*) AS count 
      FROM users 
      WHERE institute = ? 
        AND role = 'admin'
        AND account_type = 'institute'
      `,
      [institute]
    );

    res.json({
      students: students[0].count,
      guides: guides[0].count,
      admins: admins[0].count,
      totalUsers: students[0].count + guides[0].count + admins[0].count,
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

module.exports = router;