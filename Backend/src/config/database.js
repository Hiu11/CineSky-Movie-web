import mongoose from "mongoose";
import { getMongoUri } from "./env.js";

export const connectDatabase = async () => {
  const mongoUri = getMongoUri();

  if (!mongoUri) {
    throw new Error("MONGODB_URI is required");
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");
};
