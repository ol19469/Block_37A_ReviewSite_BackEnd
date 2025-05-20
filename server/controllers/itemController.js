const pool = require("../db/connection");

async function getAllItems(req, res) {
  try {
    const result = await pool.query(`
     SELECT i.*, 
     COALESCE(ROUND(AVG(r.score), 1), 0) AS average_score
     FROM items i
     LEFT JOIN reviews r ON i.id = r.item_id
     GROUP BY i.id
     ORDER BY i.id;`);
    res.json(result.rows);
  } catch (error) {
    console.error("Error getting items:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getItemById(req, res) {
  const { itemId } = req.params;
  try {
    const result = await pool.query(
      `
        SELECT i.*, 
        COALESCE(ROUND(AVG(r.score), 1), 0) AS average_score
        FROM items i
        LEFT JOIN reviews r ON i.id = r.item_id
        WHERE i.id = $1
        GROUP BY i.id;
        `,
      [itemId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error getting item by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function postReview(req, res) {
  const { itemId } = req.params;
  const { text, score } = req.body;
  const userId = req.user.id;

  try {
    // DEBUG log
    console.log("Posting review", { userId, itemId, score, text });

    const check = await pool.query(
      `SELECT * FROM reviews WHERE user_id = $1 AND item_id = $2`,
      [userId, itemId]
    );

    if (check.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this item." });
    }

    const result = await pool.query(
      `INSERT INTO reviews (user_id, item_id, text, score)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, itemId, text, score]
    );

    console.log("Review inserted:", result.rows[0]); // 👈 log what you're returning
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error posting review:", error); // 👈 you'll get full error now
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function getReviewsByItemId(req, res) {
  const { itemId } = req.params;

  try {
    const result = await pool.query(
      `SELECT r.*, u.username
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.item_id = $1
       ORDER BY created_at DESC`,
      [itemId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error getting reviews by item ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function getFullItemDetails(req, res) {
  const { itemId } = req.params;

  try {
    // 1. Get item and average score
    const itemResult = await pool.query(
      `
      SELECT i.*, 
             COALESCE(ROUND(AVG(r.score), 1), 0) AS average_score
      FROM items i
      LEFT JOIN reviews r ON i.id = r.item_id
      WHERE i.id = $1
      GROUP BY i.id;
      `,
      [itemId]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const item = itemResult.rows[0];

    // 2. Get all reviews for the item
    const reviewsResult = await pool.query(
      `
      SELECT r.*, u.username
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.item_id = $1
      ORDER BY r.created_at DESC
      `,
      [itemId]
    );

    const reviews = reviewsResult.rows;

    // 3. For each review, fetch comments
    for (const review of reviews) {
      const commentsResult = await pool.query(
        `
        SELECT c.*, u.username
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.review_id = $1
        ORDER BY c.created_at ASC
        `,
        [review.id]
      );
      review.comments = commentsResult.rows;
    }

    // 4. Respond with everything
    res.json({
      ...item,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching full item details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getAllItems,
  getItemById,
  getReviewsByItemId,
  postReview,
  getFullItemDetails,
};
