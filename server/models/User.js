const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true
    },

    location: {
      type: String
    },

    profilePhoto: {
      type: String
    },

    skillsOffered: [
      {
        type: String
      }
    ],

    skillsWanted: [
      {
        type: String
      }
    ],

    availability: {
      type: String
    },

    rating: {
      type: Number,
      default: 0
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);