const { sendError } = require("../utils/apiResponse");

exports.requireBodyFields = (fields) => (req, res, next) => {
  const missing = [];

  for (const field of fields) {
    if (req.body[field] === undefined || req.body[field] === null || req.body[field] === "") {
      missing.push(field);
    }
  }

  if (missing.length) {
    return sendError(res, 400, "Validation error", { missing });
  }

  return next();
};
