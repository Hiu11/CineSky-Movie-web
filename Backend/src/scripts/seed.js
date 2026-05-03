import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import { ensureMovieSeedData } from "../services/seed.service.js";

dotenv.config();

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
