const express = require("express");
const db = require("../config/db.cjs");
const {
  authenticateToken,
  requireRole,
} = require("../middleware/authMiddleware.js");

const router = express.Router();

router.use(authenticateToken);

router.get("/assigned-guide/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    if (req.user.role === "student" && Number(req.user.id) !== Number(studentId)) {
      return res.status(403).json({
        error: "You can only view your own assigned guide",
      });
    }

    const [rows] = await db.promise().query(
      `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.institute
      FROM guide_assignments ga
      JOIN users u ON ga.guide_id = u.id
      WHERE ga.student_id = ?
      LIMIT 1
      `,
      [studentId]
    );

    if (rows.length === 0) {
      return res.json(null);
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Assigned guide fetch error:", error);
    res.status(500).json({ error: "Failed to fetch assigned guide" });
  }
});

router.get("/students/:guideId", requireRole("guide"), async (req, res) => {
  try {
    const { guideId } = req.params;

    if (Number(req.user.id) !== Number(guideId)) {
      return res.status(403).json({
        error: "You can only view your own assigned students",
      });
    }

    const [rows] = await db.promise().query(
      `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.city,
        u.grade,
        u.institute,
        ga.assigned_at
      FROM guide_assignments ga
      JOIN users u ON ga.student_id = u.id
      WHERE ga.guide_id = ?
      ORDER BY ga.id DESC
      `,
      [guideId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Guide students fetch error:", error);
    res.status(500).json({ error: "Failed to fetch assigned students" });
  }
});

router.get(
  "/students-by-guide/:guideId",
  requireRole("guide"),
  async (req, res) => {
    try {
      const { guideId } = req.params;

      if (Number(req.user.id) !== Number(guideId)) {
        return res.status(403).json({
          error: "You can only view your own assigned students",
        });
      }

      const [guideRows] = await db.promise().query(
        `
        SELECT id, institute, account_type, role
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [guideId]
      );

      if (guideRows.length === 0) {
        return res.status(404).json({ error: "Guide not found" });
      }

      const guide = guideRows[0];

      if (guide.role !== "guide" || guide.account_type !== "institute") {
        return res.json([]);
      }

      const [students] = await db.promise().query(
        `
        SELECT 
          u.id,
          u.name,
          u.email,
          u.institute,
          u.city,
          u.grade,
          u.account_type
        FROM guide_assignments ga
        JOIN users u ON ga.student_id = u.id
        WHERE ga.guide_id = ?
          AND u.account_type = 'institute'
          AND u.role = 'student'
          AND u.institute = ?
        ORDER BY u.name
        `,
        [guideId, guide.institute]
      );

      const results = [];

      for (const student of students) {
        let recommendation = null;
        let recommendationHistory = [];

        const [recRows] = await db.promise().query(
          `
          SELECT id, field, skills, city_institutes, country_institutes, created_at
          FROM recommendations
          WHERE user_id = ?
          ORDER BY id DESC
          LIMIT 5
          `,
          [student.id]
        );

        if (recRows.length > 0) {
          recommendation = recRows[0].field;

          recommendationHistory = recRows.map((item) => ({
            id: item.id,
            field: item.field,
            skills: item.skills ? JSON.parse(item.skills) : [],
            cityInstitutes: item.city_institutes
              ? JSON.parse(item.city_institutes)
              : [],
            countryInstitutes: item.country_institutes
              ? JSON.parse(item.country_institutes)
              : [],
            created_at: item.created_at,
          }));
        }

        const [latestCommentRows] = await db.promise().query(
          `
          SELECT gc.comment_text, gc.created_at, u.name AS guide_name
          FROM guide_comments gc
          JOIN users u ON gc.guide_id = u.id
          WHERE gc.student_id = ?
          ORDER BY gc.id DESC
          LIMIT 1
          `,
          [student.id]
        );

        const [historyRows] = await db.promise().query(
          `
          SELECT gc.id, gc.comment_text, gc.created_at, u.name AS guide_name
          FROM guide_comments gc
          JOIN users u ON gc.guide_id = u.id
          WHERE gc.student_id = ?
          ORDER BY gc.id DESC
          LIMIT 5
          `,
          [student.id]
        );

        results.push({
          ...student,
          recommendation,
          recommendationHistory,
          latestComment:
            latestCommentRows.length > 0 ? latestCommentRows[0] : null,
          commentHistory: historyRows,
        });
      }

      res.json(results);
    } catch (error) {
      console.error("Guide students fetch error:", error);
      res.status(500).json({ error: "Failed to fetch assigned students" });
    }
  }
);

router.post("/comment", requireRole("guide"), async (req, res) => {
  try {
    const { student_id, guide_id, comment_text } = req.body;

    if (!student_id || !guide_id || !comment_text) {
      return res.status(400).json({
        error: "student_id, guide_id and comment_text are required",
      });
    }

    if (Number(req.user.id) !== Number(guide_id)) {
      return res.status(403).json({
        error: "You can only comment as your own guide account",
      });
    }

    const [assignmentRows] = await db.promise().query(
      `
      SELECT id
      FROM guide_assignments
      WHERE student_id = ?
        AND guide_id = ?
      LIMIT 1
      `,
      [student_id, guide_id]
    );

    if (assignmentRows.length === 0) {
      return res.status(403).json({
        error: "You can only comment on assigned students",
      });
    }

    await db.promise().query(
      `
      INSERT INTO guide_comments
      (student_id, guide_id, comment_text)
      VALUES (?, ?, ?)
      `,
      [student_id, guide_id, comment_text]
    );

    await db.promise().query(
      `
      INSERT INTO notifications
      (user_id, title, message)
      VALUES (?, ?, ?)
      `,
      [
        student_id,
        "New Guide Comment",
        "Your career guide added a new comment to your profile.",
      ]
    );

    res.json({
      success: true,
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error("Guide comment error:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

router.get("/comments-by-student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    if (req.user.role === "student" && Number(req.user.id) !== Number(studentId)) {
      return res.status(403).json({
        error: "You can only view your own comments",
      });
    }

    if (req.user.role === "guide") {
      const [assignmentRows] = await db.promise().query(
        `
        SELECT id
        FROM guide_assignments
        WHERE student_id = ?
          AND guide_id = ?
        LIMIT 1
        `,
        [studentId, req.user.id]
      );

      if (assignmentRows.length === 0) {
        return res.status(403).json({
          error: "You can only view comments for assigned students",
        });
      }
    }

    const [rows] = await db.promise().query(
      `
      SELECT 
        gc.id,
        gc.comment_text,
        gc.created_at,
        u.name AS guide_name
      FROM guide_comments gc
      JOIN users u ON gc.guide_id = u.id
      WHERE gc.student_id = ?
      ORDER BY gc.id DESC
      `,
      [studentId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Student comments fetch error:", error);
    res.status(500).json({ error: "Failed to fetch guide comments" });
  }
});

router.get(
  "/comments-by-guide/:guideId",
  requireRole("guide"),
  async (req, res) => {
    try {
      const { guideId } = req.params;

      if (Number(req.user.id) !== Number(guideId)) {
        return res.status(403).json({
          error: "You can only view your own comments",
        });
      }

      const [rows] = await db.promise().query(
        `
        SELECT 
          gc.id,
          gc.comment_text,
          gc.created_at,
          u.name AS student_name
        FROM guide_comments gc
        JOIN users u ON gc.student_id = u.id
        WHERE gc.guide_id = ?
        ORDER BY gc.id DESC
        `,
        [guideId]
      );

      res.json(rows);
    } catch (error) {
      console.error("Guide comments fetch error:", error);
      res.status(500).json({ error: "Failed to fetch guide comments" });
    }
  }
);

module.exports = router;