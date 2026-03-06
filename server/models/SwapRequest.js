const mongoose = require("mongoose");

const swapRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    skillOffered: {
      type: String,
      required: true,
      trim: true
    },
    skillRequested: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate *pending* swap requests for the same pair and skills.
swapRequestSchema.index(
  {
    sender: 1,
    receiver: 1,
    skillOffered: 1,
    skillRequested: 1,
    status: 1
  },
  {
    unique: true,
    partialFilterExpression: { status: "pending" }
  }
);

module.exports = mongoose.model("SwapRequest", swapRequestSchema);
