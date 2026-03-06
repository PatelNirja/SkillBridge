const User = require("../models/User");
const { sendError } = require("../utils/apiResponse");

module.exports = async (req, res, next) => {
  try {
    // authMiddleware sets req.user = userId
    const user = await User.findById(req.user).select("role");

    if (!user) {
      return sendError(res, 401, "Unauthorized");
    }

    if (user.role !== "admin") {
      return sendError(res, 403, "Admin access required");
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
