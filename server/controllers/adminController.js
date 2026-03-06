const User = require("../models/User");
const SwapRequest = require("../models/SwapRequest");
const Feedback = require("../models/Feedback");
const asyncHandler = require("../middleware/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

exports.getAllUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments({})
  ]);

  return sendSuccess(res, 200, { page, limit, total, results: users });
});

exports.banUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (String(id) === String(req.user)) {
    return sendError(res, 400, "Admin cannot ban themselves" );
  }

  // NOTE: This performs a soft-ban by setting isBanned=true.
  // To fully enforce bans across the platform, protected routes should also check isBanned.
  const user = await User.findByIdAndUpdate(
    id,
    { isBanned: true },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    return sendError(res, 404, "User not found" );
  }

  return sendSuccess(res, 200, user, "User banned" );
});

exports.removeUserSkill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { skill, list } = req.body;

  if (!skill || typeof skill !== "string" || !skill.trim()) {
    return sendError(res, 400, "skill is required");
  }

  const listValue = typeof list === "string" ? list.trim().toLowerCase() : "";
  if (listValue !== "offered" && listValue !== "wanted") {
    return sendError(res, 400, "list must be 'offered' or 'wanted'");
  }

  const trimmedSkill = skill.trim();
  const pull =
    listValue === "offered"
      ? { skillsOffered: trimmedSkill }
      : { skillsWanted: trimmedSkill };

  const user = await User.findByIdAndUpdate(
    id,
    { $pull: pull },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    return sendError(res, 404, "User not found");
  }

  return sendSuccess(res, 200, user, "Skill removed");
});

exports.getPlatformStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalSwaps,
    pendingSwaps,
    acceptedSwaps,
    rejectedSwaps,
    cancelledSwaps,
    totalFeedback
  ] = await Promise.all([
    User.countDocuments({}),
    SwapRequest.countDocuments({}),
    SwapRequest.countDocuments({ status: "pending" }),
    SwapRequest.countDocuments({ status: "accepted" }),
    SwapRequest.countDocuments({ status: "rejected" }),
    SwapRequest.countDocuments({ status: "cancelled" }),
    Feedback.countDocuments({})
  ]);

  return sendSuccess(res, 200, {
    totalUsers,
    totalSwaps,
    swapsByStatus: {
      pending: pendingSwaps,
      accepted: acceptedSwaps,
      rejected: rejectedSwaps,
      cancelled: cancelledSwaps
    },
    totalFeedback
  });
});
