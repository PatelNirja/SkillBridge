exports.sendSuccess = (res, statusCode, data, message) => {
  const payload = {
    success: true
  };

  if (typeof message === "string") payload.message = message;
  if (data !== undefined) payload.data = data;

  return res.status(statusCode).json(payload);
};

exports.sendError = (res, statusCode, message, details) => {
  const payload = {
    success: false,
    message: typeof message === "string" ? message : "Request failed"
  };

  if (details !== undefined) payload.details = details;

  return res.status(statusCode).json(payload);
};
