import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandlerMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import rootRouter from "./routes/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const configuredFrontendOrigins = String(
  process.env.FRONTEND_URLS || process.env.FRONTEND_URL || ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin = "") => {
  if (!origin) {
    return true;
  }

  if (configuredFrontendOrigins.includes(origin)) {
    return true;
  }

  return (
    origin === "http://localhost:3000" ||
    origin === "http://localhost:5173" ||
    /^https:\/\/cine-sky-fe(?:-[a-z0-9-]+)?-[a-z0-9-]+\.vercel\.app$/i.test(origin) ||
    /^https:\/\/cine-sky-[a-z0-9-]+-cine-sky-s-projects\.vercel\.app$/i.test(origin)
  );
};

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" }));

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
