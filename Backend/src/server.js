import dotenv from "dotenv";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { ensureMovieSeedData } from "./services/seed.service.js";

dotenv.config();

const shouldSeedOnStart =
  String(process.env.SEED_ON_START || "").toLowerCase() === "true";

const startServer = async () => {
  try {
    await connectDatabase();

    if (shouldSeedOnStart) {
      await ensureMovieSeedData();
    }

    const port = Number(process.env.PORT) || 5000;
    app.listen(port, () => {
      console.log(`Backend server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error.message);
    process.exit(1);
  }
};

startServer();
