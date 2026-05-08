import cors from "cors";
import express from "express";
import { errorHandlerMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import rootRouter from "./routes/index.js";

const app = express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json({ limit: "10mb" }));

app.get("/api/v1/health", (req, res) => {
  res.status(200).send({
    success: true,
    message: "Backend is running",
  });
});

app.use("/api/v1", rootRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;
