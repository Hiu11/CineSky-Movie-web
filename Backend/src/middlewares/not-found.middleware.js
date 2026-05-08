export const notFoundMiddleware = (req, res) => {
  res.status(404).send({
    success: false,
    message: "API not found",
    data: null,
  });
};
