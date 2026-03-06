const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getMyProfile,
  updateMyProfile,
  getPublicProfileById,
  searchUsers
} = require("../controllers/userController");

// Current user's profile (requires auth)
router.get("/me", authMiddleware, getMyProfile);
router.put("/me", authMiddleware, updateMyProfile);

// User discovery / search
// Example: /api/users/search?skill=python&type=offered&location=pune&page=1&limit=10
router.get("/search", searchUsers);

// Public profile lookup
router.get("/:id", getPublicProfileById);

module.exports = router;
