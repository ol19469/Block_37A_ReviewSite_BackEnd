const pool = require("../db/connection");

async function getAllItems(req, res) {
  try {
    const results = await pool.query("SELECT * FROM items");
    res.json(results.rows);
  } catch (error) {
    console.error("Error getting items:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { getAllItems };
