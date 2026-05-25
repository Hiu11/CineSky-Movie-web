import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "../src/app.js";
import { connectDatabase } from "../src/config/database.js";
import {
  ensureAdminAccount,
  ensureMovieSeedData,
} from "../src/services/seed.service.js";

dotenv.config();

let bootstrapPromise;

const shouldSeedOnStart =
  String(process.env.SEED_ON_START || "").toLowerCase() === "true";

const bootstrap = async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDatabase();
  }

  await ensureAdminAccount();

  if (shouldSeedOnStart) {
    await ensureMovieSeedData();
  }
};

export default async function handler(req, res) {
  try {
    bootstrapPromise ||= bootstrap();
    await bootstrapPromise;
    return app(req, res);
  } catch (error) {
    console.error("Failed to bootstrap backend:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to bootstrap backend",
      data: null,
    });
  }
}
