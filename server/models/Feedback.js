const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    swapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SwapRequest",
      required: true,
      index: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  {
    timestamps: true
  }
);

// Prevent multiple feedback submissions for the same swap by the same author.
feedbackSchema.index({ fromUser: 1, swapId: 1 }, { unique: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
