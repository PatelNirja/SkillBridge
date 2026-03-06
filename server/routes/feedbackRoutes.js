const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { requireBodyFields } = require("../middleware/validate");

const { addFeedback, getFeedbackForUser } = require("../controllers/feedbackController");

router.post(
  "/add",
  authMiddleware,
  requireBodyFields(["toUser", "swapId", "rating"]),
  addFeedback
);

router.get("/user/:id", getFeedbackForUser);

module.exports = router;
