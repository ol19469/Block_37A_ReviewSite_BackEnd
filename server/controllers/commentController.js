const pool = require("../db/connection");

// POST comment
async function createComment(req, res) {
  const { reviewId } = req.params;
  const { text } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `INSERT INTO comments (user_id, review_id, text)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, reviewId, text]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error posting comment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// GET /comments/me
async function getMyComments(req, res) {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT * FROM comments WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error getting comments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// PUT comment
async function updateComment(req, res) {
  const { userId, commentId } = req.params;
  const { text } = req.body;

  console.log("Updating comment with:", { commentId, userId, text });
  if (parseInt(userId) !== req.user.id) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const result = await pool.query(
      `UPDATE comments
       SET text = $1, created_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [text, commentId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// DELETE comment
async function deleteComment(req, res) {
  const { userId, commentId } = req.params;

  if (parseInt(userId) !== req.user.id) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const result = await pool.query(
      `DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING *`,
      [commentId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json({ message: "Comment deleted" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function getCommentsForReview(req, res) {
  const { reviewId } = req.params;

  try {
    const result = await pool.query(
      `SELECT comments.*, users.username
         FROM comments
         JOIN users ON comments.user_id = users.id
         WHERE review_id = $1
         ORDER BY created_at ASC`,
      [reviewId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error getting comments for review:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  createComment,
  getMyComments,
  updateComment,
  deleteComment,
  getCommentsForReview,
};
