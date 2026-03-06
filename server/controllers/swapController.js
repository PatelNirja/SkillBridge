const SwapRequest = require("../models/SwapRequest");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const normalizeSkill = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 50) return null;
  return trimmed;
};

exports.createSwapRequest = asyncHandler(async (req, res) => {
  const { receiver, skillOffered, skillRequested } = req.body;

  if (!receiver) {
    return sendError(res, 400, "receiver is required");
  }

  if (String(receiver) === String(req.user)) {
    return sendError(res, 400, "sender and receiver must be different");
  }

  const offered = normalizeSkill(skillOffered);
  const requested = normalizeSkill(skillRequested);

  if (!offered || !requested) {
    return sendError(res, 400, "skillOffered and skillRequested are required");
  }

  // Ensure receiver exists
  const receiverUser = await User.findById(receiver).select("_id");
  if (!receiverUser) {
    return sendError(res, 404, "Receiver not found");
  }

  // Prevent duplicates (also enforced via partial unique index)
  const existing = await SwapRequest.findOne({
    sender: req.user,
    receiver,
    skillOffered: offered,
    skillRequested: requested,
    status: "pending"
  }).select("_id");

  if (existing) {
    return sendError(res, 409, "Duplicate pending swap request already exists");
  }

  const swap = await SwapRequest.create({
    sender: req.user,
    receiver,
    skillOffered: offered,
    skillRequested: requested
  });

  return sendSuccess(res, 201, swap, "Swap request created");
});

exports.getPendingSwaps = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const skip = (page - 1) * limit;

  // Pending swaps where current user is the receiver
  const filter = { receiver: req.user, status: "pending" };

  const [swaps, total] = await Promise.all([
    SwapRequest.find(filter)
      .populate("sender", "name location profilePhoto rating")
      .populate("receiver", "name location profilePhoto rating")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    SwapRequest.countDocuments(filter)
  ]);

  return sendSuccess(res, 200, { page, limit, total, results: swaps });
});

exports.acceptSwap = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const swap = await SwapRequest.findById(id);
  if (!swap) {
    return sendError(res, 404, "Swap request not found");
  }

  if (String(swap.receiver) !== String(req.user)) {
    return sendError(res, 403, "Only the receiver can accept this request");
  }

  if (swap.status !== "pending") {
    return sendError(res, 400, `Cannot accept a swap in status '${swap.status}'`);
  }

  swap.status = "accepted";
  await swap.save();

  return sendSuccess(res, 200, swap, "Swap request accepted");
});

exports.rejectSwap = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const swap = await SwapRequest.findById(id);
  if (!swap) {
    return sendError(res, 404, "Swap request not found");
  }

  if (String(swap.receiver) !== String(req.user)) {
    return sendError(res, 403, "Only the receiver can reject this request");
  }

  if (swap.status !== "pending") {
    return sendError(res, 400, `Cannot reject a swap in status '${swap.status}'`);
  }

  swap.status = "rejected";
  await swap.save();

  return sendSuccess(res, 200, swap, "Swap request rejected");
});

exports.cancelSwap = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const swap = await SwapRequest.findById(id);
  if (!swap) {
    return sendError(res, 404, "Swap request not found");
  }

  if (String(swap.sender) !== String(req.user)) {
    return sendError(res, 403, "Only the sender can cancel this request");
  }

  if (swap.status !== "pending") {
    return sendError(res, 400, `Cannot cancel a swap in status '${swap.status}'`);
  }

  swap.status = "cancelled";
  await swap.save();

  return sendSuccess(res, 200, swap, "Swap request cancelled");
});
