import mongoose from "mongoose";
import { config } from "dotenv";
import { join } from "path";
import MovieModel from "./src/models/movie.model.js";

config({ path: join(process.cwd(), ".env") });

async function fixPosters() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const movies = await MovieModel.find({ poster: /via\.placeholder\.com/ });
    console.log(`Found ${movies.length} movies with bad poster URLs.`);

    let count = 0;
    for (const movie of movies) {
      if (movie.poster.includes("via.placeholder.com")) {
        movie.poster = movie.poster.replace("via.placeholder.com", "placehold.co");
        // placehold.co uses a slightly different format: placehold.co/600x900?text=...
        // via.placeholder.com/600x900.png?text=... -> placehold.co/600x900/png?text=...
        movie.poster = movie.poster.replace(".png", "/png");
        await movie.save();
        count++;
      }
    }

    console.log(`Updated ${count} movies.`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

fixPosters();
