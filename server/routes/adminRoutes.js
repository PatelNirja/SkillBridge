const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/requireAdmin");

const {
  getAllUsers,
  banUser,
  removeUserSkill,
  getPlatformStats
} = require("../controllers/adminController");

router.get("/users", authMiddleware, requireAdmin, getAllUsers);
router.put("/ban/:id", authMiddleware, requireAdmin, banUser);
router.delete("/users/:id/skills", authMiddleware, requireAdmin, removeUserSkill);
router.get("/stats", authMiddleware, requireAdmin, getPlatformStats);

module.exports = router;
