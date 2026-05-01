import cors from "cors";
import express from "express";
import rootRouter from "./routes/index.js";

const app = express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

app.get("/api/v1/health", (req, res) => {
  res.status(200).send({
    success: true,
    message: "Backend is running",
  });
});

app.use("/api/v1", rootRouter);

app.use((req, res) => {
  res.status(404).send({
    success: false,
    message: "API not found",
    data: null,
  });
});

export default app;
