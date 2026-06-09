import fs from "fs";
import https from "https";
import path from "path";
import mongoose from "mongoose";
import { config } from "dotenv";
import MovieModel from "./src/models/movie.model.js";

config({ path: path.join(process.cwd(), ".env") });

const imageUrl = "https://upload.wikimedia.org/wikipedia/vi/a/a2/Doraemon_Nobita_va_Lau_dai_duoi_day_bien.jpg";
const dest = path.join(process.cwd(), "../Frontend/public/assets/images/nobita-dai-duong.jpg");

async function downloadAndFix() {
  const file = fs.createWriteStream(dest);
  
  https.get(imageUrl, function(response) {
    response.pipe(file);
    file.on('finish', async function() {
      file.close();  
      console.log("Downloaded Doraemon image locally.");

      try {
        await mongoose.connect(process.env.MONGODB_URI);
        const movie = await MovieModel.findOne({ title: /Nobita/i });
        if (movie) {
          movie.poster = "/assets/images/nobita-dai-duong.jpg";
          await movie.save();
          console.log("Updated database to use local Doraemon image.");
        }
      } catch (e) {
        console.error(e);
      } finally {
        await mongoose.disconnect();
        console.log("Done.");
      }
    });
  }).on('error', function(err) {
    fs.unlink(dest, () => {}); 
    console.error("Error downloading image:", err);
  });
}

downloadAndFix();
