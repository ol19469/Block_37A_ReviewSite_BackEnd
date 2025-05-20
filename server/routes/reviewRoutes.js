const express = require("express");
const router = express.Router();
const {
  getMyReviews,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const requireUser = require("../middleware/requireUser");

router.get("/me", requireUser, getMyReviews);

router.put("/users/:userId/reviews/:reviewId", requireUser, updateReview);

router.delete("/users/:userId/reviews/:reviewId", requireUser, deleteReview);

module.exports = router;
