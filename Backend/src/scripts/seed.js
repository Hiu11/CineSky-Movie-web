import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { connectDatabase } from "../config/database.js";
import { ensureMovieSeedData } from "../services/seed.service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const runSeed = async () => {
  try {
    await connectDatabase();
    await ensureMovieSeedData();
    console.log("Seed completed successfully");
    await mongoose.disconnect();
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

runSeed();
