const User = require("../models/User");

const pickUpdatableProfileFields = (body) => {
  const update = {};

  if (typeof body.name === "string") update.name = body.name;
  if (typeof body.location === "string") update.location = body.location;
  if (typeof body.profilePhoto === "string") update.profilePhoto = body.profilePhoto;
  if (typeof body.availability === "string") update.availability = body.availability;

  if (Array.isArray(body.skillsOffered)) update.skillsOffered = body.skillsOffered;
  if (Array.isArray(body.skillsWanted)) update.skillsWanted = body.skillsWanted;

  return update;
};

exports.getMyProfile = async (req, res) => {
  try {
    // authMiddleware sets req.user = authenticated user's id
    const user = await User.findById(req.user).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const update = pickUpdatableProfileFields(req.body);

    // Only allow updating profile-related fields (no password/role updates here)
    const user = await User.findByIdAndUpdate(req.user, update, {
      new: true,
      runValidators: true
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getPublicProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    // Public profile endpoint: exclude password and other sensitive fields
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const {
      q,
      skill,
      type = "any",
      location,
      page = "1",
      limit = "10"
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    const skip = (pageNumber - 1) * limitNumber;

    const filter = {};

    // Name search
    if (typeof q === "string" && q.trim()) {
      filter.name = { $regex: q.trim(), $options: "i" };
    }

    // Location filter
    if (typeof location === "string" && location.trim()) {
      filter.location = { $regex: location.trim(), $options: "i" };
    }

    // Skill filter
    if (typeof skill === "string" && skill.trim()) {
      const skillRegex = { $regex: skill.trim(), $options: "i" };

      if (type === "offered") {
        filter.skillsOffered = skillRegex;
      } else if (type === "wanted") {
        filter.skillsWanted = skillRegex;
      } else {
        filter.$or = [{ skillsOffered: skillRegex }, { skillsWanted: skillRegex }];
      }
    }

    const [users, total] = await Promise.all([
      // Keep response safe by excluding password
      User.find(filter)
        .select("-password")
        .sort({ rating: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      User.countDocuments(filter)
    ]);

    return res.json({
      page: pageNumber,
      limit: limitNumber,
      total,
      results: users
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
