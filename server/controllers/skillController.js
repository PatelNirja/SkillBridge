const User = require("../models/User");

const normalizeSkill = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 50) return null;
  return trimmed;
};

exports.addOfferedSkill = async (req, res) => {
  try {
    const skill = normalizeSkill(req.body.skill);

    if (!skill) {
      return res.status(400).json({ message: "Skill is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user,
      { $addToSet: { skillsOffered: skill } },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "Offered skill added", skillsOffered: user.skillsOffered });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.addWantedSkill = async (req, res) => {
  try {
    const skill = normalizeSkill(req.body.skill);

    if (!skill) {
      return res.status(400).json({ message: "Skill is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user,
      { $addToSet: { skillsWanted: skill } },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "Wanted skill added", skillsWanted: user.skillsWanted });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.removeSkill = async (req, res) => {
  try {
    // Supports removing from offered, wanted, or both
    const skill = normalizeSkill(req.body.skill || req.query.skill);
    const list = typeof req.body.list === "string" ? req.body.list : req.query.list;

    if (!skill) {
      return res.status(400).json({ message: "Skill is required" });
    }

    const listValue = typeof list === "string" ? list.trim().toLowerCase() : "both";

    const update = {};

    if (listValue === "offered") {
      update.$pull = { skillsOffered: skill };
    } else if (listValue === "wanted") {
      update.$pull = { skillsWanted: skill };
    } else if (listValue === "both") {
      update.$pull = { skillsOffered: skill, skillsWanted: skill };
    } else {
      return res.status(400).json({ message: "Invalid list. Use offered, wanted, or both" });
    }

    const user = await User.findByIdAndUpdate(req.user, update, { new: true }).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Skill removed",
      skillsOffered: user.skillsOffered,
      skillsWanted: user.skillsWanted
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getUserSkills = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select("name location profilePhoto skillsOffered skillsWanted rating");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      userId: user._id,
      name: user.name,
      location: user.location,
      profilePhoto: user.profilePhoto,
      rating: user.rating,
      skillsOffered: user.skillsOffered,
      skillsWanted: user.skillsWanted
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
