const Feedback = require("../models/Feedback");
const SwapRequest = require("../models/SwapRequest");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const updateUserAverageRating = async (userId) => {
  const stats = await Feedback.aggregate([
    { $match: { toUser: userId } },
    {
      $group: {
        _id: "$toUser",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 }
      }
    }
  ]);

  const avg = stats.length ? stats[0].avgRating : 0;

  await User.findByIdAndUpdate(userId, { rating: avg });
};

exports.addFeedback = asyncHandler(async (req, res) => {
  const { toUser, swapId, rating, comment } = req.body;

  if (!toUser || !swapId) {
    return sendError(res, 400, "toUser and swapId are required");
  }

  if (String(toUser) === String(req.user)) {
    return sendError(res, 400, "You cannot leave feedback for yourself");
  }

  const numericRating = Number(rating);
  if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
    return sendError(res, 400, "Rating must be between 1 and 5");
  }

  const swap = await SwapRequest.findById(swapId).select("sender receiver status");
  if (!swap) {
    return sendError(res, 404, "Swap not found");
  }

  // Allow feedback only after an accepted swap (interpreted as completed)
  if (swap.status !== "accepted") {
    return sendError(res, 400, "Feedback can be left only after the swap is accepted" );
  }

  const isParticipant =
    String(swap.sender) === String(req.user) || String(swap.receiver) === String(req.user);

  if (!isParticipant) {
    return sendError(res, 403, "You are not a participant in this swap" );
  }

  const otherParty = String(swap.sender) === String(req.user) ? swap.receiver : swap.sender;

  if (String(otherParty) !== String(toUser)) {
    return sendError(res, 400, "toUser must be the other participant in the swap" );
  }

  let feedback;
  try {
    feedback = await Feedback.create({
      fromUser: req.user,
      toUser,
      swapId,
      rating: numericRating,
      comment
    });
  } catch (error) {
    // Unique index: { fromUser, swapId }
    if (error && error.code === 11000) {
      return sendError(res, 409, "Feedback already submitted for this swap" );
    }
    throw error;
  }

  await updateUserAverageRating(feedback.toUser);

  return sendSuccess(res, 201, feedback, "Feedback added" );
});

exports.getFeedbackForUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const skip = (page - 1) * limit;

  const filter = { toUser: id };

  const [feedback, total] = await Promise.all([
    Feedback.find(filter)
      .populate("fromUser", "name profilePhoto")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Feedback.countDocuments(filter)
  ]);

  return sendSuccess(res, 200, { page, limit, total, results: feedback });
});
