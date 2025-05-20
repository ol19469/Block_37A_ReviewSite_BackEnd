const pool = require("./connection");
const bcrypt = require("bcrypt");

async function seed() {
  const hashedAlice = await bcrypt.hash("password123", 10);
  const hashedBob = await bcrypt.hash("password123", 10);
  try {
    await pool.query(`DROP TABLE IF EXISTS reviews CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS items CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS users CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS comments CASCADE;`);

    await pool.query(`CREATE TABLE items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
        CREATE TABLE reviews (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
          text TEXT NOT NULL,
          score INTEGER CHECK (score >= 1 AND score <= 5),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

    await pool.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    await pool.query(`
        CREATE TABLE comments (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
          text TEXT NOT NULL,
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
    await pool.query(`
        INSERT INTO reviews (user_id, item_id, text, score) VALUES
        (1, 1, 'Great coffee and service.', 5),
        (2, 1, 'Nice place to relax.', 4),
        (1, 2, 'Loved the book selection.', 5),
        (3, 3, 'Powerful laptop but expensive.', 4);
      `);
    await pool.query(
      `
        INSERT INTO users (username, email, password) VALUES
        ('alice', 'alice@example.com', $1),
        ('bob', 'bob@example.com', $2);
      `,
      [hashedAlice, hashedBob]
    );

    console.log("✅ Database seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
