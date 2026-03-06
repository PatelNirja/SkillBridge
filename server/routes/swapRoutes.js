const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { requireBodyFields } = require("../middleware/validate");

const {
  createSwapRequest,
  getPendingSwaps,
  acceptSwap,
  rejectSwap,
  cancelSwap
} = require("../controllers/swapController");

router.post(
  "/request",
  authMiddleware,
  requireBodyFields(["receiver", "skillOffered", "skillRequested"]),
  createSwapRequest
);

router.get("/pending", authMiddleware, getPendingSwaps);
router.put("/accept/:id", authMiddleware, acceptSwap);
router.put("/reject/:id", authMiddleware, rejectSwap);
router.delete("/cancel/:id", authMiddleware, cancelSwap);

module.exports = router;
