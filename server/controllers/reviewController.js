const pool = require("../db/connection");

async function getMyReviews(req, res) {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT * FROM reviews WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error getting user's reviews:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateReview(req, res) {
  const { userId, reviewId } = req.params;
  const { text, score } = req.body;

  if (parseInt(userId) !== req.user.id) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const result = await pool.query(
      `UPDATE reviews
       SET text = $1, score = $2, created_at = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [text, score, reviewId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteReview(req, res) {
  const { userId, reviewId } = req.params;

  if (parseInt(userId) !== req.user.id) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const result = await pool.query(
      `DELETE FROM reviews
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [reviewId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getMyReviews,
  updateReview,
  deleteReview,
};
