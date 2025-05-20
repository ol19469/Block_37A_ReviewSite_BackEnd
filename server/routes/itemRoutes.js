const express = require("express");
const router = express.Router();
const {
  getAllItems,
  getItemById,
  getReviewsByItemId,
  postReview,
  getFullItemDetails,
} = require("../controllers/itemController");

const requireUser = require("../middleware/requireUser");

router.get("/", getAllItems);

router.get("/:itemId", getItemById);

router.get("/:itemId/reviews", getReviewsByItemId);

router.post("/:itemId/reviews", requireUser, postReview);

router.get("/:itemId/full", getFullItemDetails);

module.exports = router;
