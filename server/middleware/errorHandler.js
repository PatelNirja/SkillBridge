const { sendError } = require("../utils/apiResponse");

// Centralized error handler (must be registered after routes)
module.exports = (err, req, res, next) => {
  // eslint-disable-next-line no-unused-vars
  const _next = next;

  const statusCode = err.statusCode || 500;

  // Handle mongoose duplicate key error
  if (err && err.code === 11000) {
    return sendError(res, 409, "Duplicate resource");
  }

  // Handle invalid ObjectId cast
  if (err && err.name === "CastError") {
    return sendError(res, 400, "Invalid id");
  }

  return sendError(res, statusCode, err.message || "Internal Server Error");
};
