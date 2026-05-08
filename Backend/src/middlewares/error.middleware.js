export const errorHandlerMiddleware = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  return res.status(error?.status || 500).send({
    success: false,
    message: error?.message || "Internal server error",
    data: null,
  });
};
