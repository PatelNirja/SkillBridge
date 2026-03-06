const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addOfferedSkill,
  addWantedSkill,
  removeSkill,
  getUserSkills
} = require("../controllers/skillController");

// Protected: manage your own skills
router.post("/add-offered", authMiddleware, addOfferedSkill);
router.post("/add-wanted", authMiddleware, addWantedSkill);
router.delete("/remove", authMiddleware, removeSkill);

// Public: view another user's skills
router.get("/user/:id", getUserSkills);

module.exports = router;
