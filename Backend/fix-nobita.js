import mongoose from "mongoose";
import { config } from "dotenv";
import { join } from "path";
import MovieModel from "./src/models/movie.model.js";

config({ path: join(process.cwd(), ".env") });

async function fixNobitaPoster() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const movie = await MovieModel.findOne({ title: /Nobita/i });
    if (movie) {
      console.log(`Found movie: ${movie.title}`);
      // Use a guaranteed local image from the project to prevent hotlinking errors
      movie.poster = "/assets/images/phim-super-mario-thien-ha.jpg";
      await movie.save();
      console.log("Updated poster for Nobita.");
    } else {
      console.log("Could not find the Nobita movie.");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

fixNobitaPoster();
