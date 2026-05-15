const express = require("express");
const db = require("../config/db.cjs");

const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.promise().query(
      `
      SELECT id, title, message, is_read, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC, id DESC
      `,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Fetch notifications error:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

router.put("/read/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;

    await db.promise().query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = ?
      `,
      [notificationId]
    );

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

module.exports = router;