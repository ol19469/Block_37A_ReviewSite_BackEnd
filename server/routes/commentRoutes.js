const express = require("express");
const router = express.Router();
const {
  createComment,
  getMyComments,
  updateComment,
  deleteComment,
  getCommentsForReview,
} = require("../controllers/commentController");

const requireUser = require("../middleware/requireUser");

router.post(
  "/items/:itemId/reviews/:reviewId/comments",
  requireUser,
  createComment
);
router.get("/items/:itemId/reviews/:reviewId/comments", getCommentsForReview);
router.get("/comments/me", requireUser, getMyComments);
router.put("/users/:userId/comments/:commentId", requireUser, updateComment);
router.delete("/users/:userId/comments/:commentId", requireUser, deleteComment);

module.exports = router;
