const pool = require("./connection");

async function seed() {
  try {
    await pool.query(`DROP TABLE IF EXISTS items;`);

    await pool.query(`CREATE TABLE items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      INSERT INTO items (name, description, category) VALUES
      ('Coffee Shop', 'A cozy coffee shop.', 'Restaurant'),
      ('Bookstore', 'Independent bookstore with rare books.', 'Shop'),
      ('Gaming Laptop', 'High performance laptop for gaming.', 'Electronics'),
      ('Pizza Place', 'Authentic Italian pizza.', 'Restaurant'),
      ('Headphones', 'Noise-cancelling wireless headphones.', 'Electronics');
    `);

    console.log("✅ Database seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
