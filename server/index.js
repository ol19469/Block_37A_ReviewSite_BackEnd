const express = require("express");
const app = express();
require("dotenv").config();

const itemsRoutes = require("./routes/itemRoutes");
const authRoutes = require("./routes/authRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const commentRoutes = require("./routes/commentRoutes");

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/reviews", reviewRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", commentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
