import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandlerMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import rootRouter from "./routes/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Chỉ cho phép frontend domain đã cấu hình – không mở wildcard "*"
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" }));

// Cho phép frontend mở ảnh đã upload bằng URL dạng http://localhost:5000/uploads/...
app.use("/uploads", express.static(path.resolve(__dirname, "../public/uploads")));

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
