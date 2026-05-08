import bcrypt from "bcryptjs";
import {
  getAdminEmail,
  getAdminFullName,
  getAdminPassword,
} from "../config/env.js";
import { buildMovieDetailSeed } from "../data/movieDetailSeed.js";
import seedFeedbackEntries from "../data/seedFeedback.js";
import seedMovies from "../data/seedMovies.js";
import { createShowtimesFromMovies } from "../data/seedShowtimes.js";
import BookingModel from "../models/booking.model.js";
import FeedbackModel from "../models/feedback.model.js";
import FavoriteModel from "../models/favorite.model.js";
import GenreModel from "../models/genre.model.js";
import MovieModel from "../models/movie.model.js";
import ReviewModel from "../models/review.model.js";
import ShowtimeModel from "../models/showtime.model.js";
import UserModel from "../models/user.model.js";

const slugifyText = (value) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const movieLegacyIdMigrationMap = new Map([
  [204, 1],
  [205, 2],
  [206, 3],
  [207, 4],
  [301, 5],
  [302, 6],
  [303, 7],
  [304, 8],
  [305, 9],
  [306, 10],
  [307, 11],
  [201, 12],
  [202, 13],
  [203, 14],
  [1, 15],
  [2, 16],
  [3, 17],
  [4, 18],
  [5, 19],
  [6, 20],
  [7, 21],
  [308, 101],
  [309, 102],
  [310, 103],
  [103, 104],
  [102, 105],
  [101, 106],
]);

export const ensureMovieSeedData = async () => {
  const moviesWithDetails = seedMovies.map((movie) => ({
    ...movie,
    ...buildMovieDetailSeed(movie),
  }));

  await MovieModel.bulkWrite(
    moviesWithDetails.map((movie, index) => ({
      updateOne: {
        filter: { slug: movie.slug },
        update: { $set: { legacyId: -(index + 1) } },
      },
    }))
  );

  await MovieModel.bulkWrite(
    moviesWithDetails.map((movie) => ({
      updateOne: {
        filter: { slug: movie.slug },
        update: { $set: movie },
        upsert: true,
      },
    }))
  );

  await Promise.all(
    [...movieLegacyIdMigrationMap.entries()].flatMap(([oldId, newId]) => [
      ShowtimeModel.updateMany({ movieLegacyId: oldId }, { $set: { movieLegacyId: -newId } }),
      BookingModel.updateMany({ movieLegacyId: oldId }, { $set: { movieLegacyId: -newId } }),
      FavoriteModel.updateMany({ movieLegacyId: oldId }, { $set: { movieLegacyId: -newId } }),
      ReviewModel.updateMany({ movieLegacyId: oldId }, { $set: { movieLegacyId: -newId } }),
    ])
  );

  await Promise.all(
    [...movieLegacyIdMigrationMap.values()].flatMap((newId) => [
      ShowtimeModel.updateMany({ movieLegacyId: -newId }, { $set: { movieLegacyId: newId } }),
      BookingModel.updateMany({ movieLegacyId: -newId }, { $set: { movieLegacyId: newId } }),
      FavoriteModel.updateMany({ movieLegacyId: -newId }, { $set: { movieLegacyId: newId } }),
      ReviewModel.updateMany({ movieLegacyId: -newId }, { $set: { movieLegacyId: newId } }),
    ])
  );

  console.log("Synced movie seed data");

  const genres = Array.from(new Set(seedMovies.flatMap((movie) => movie.genres))).map((name) => ({
    name,
    slug: slugifyText(name),
  }));

  await GenreModel.bulkWrite(
    genres.map((genre) => ({
      updateOne: {
        filter: {
          $or: [{ name: genre.name }, { slug: genre.slug }],
        },
        update: {
          $set: genre,
        },
        upsert: true,
      },
    }))
  );

  const showtimes = createShowtimesFromMovies(seedMovies);

  if (showtimes.length > 0) {
    await ShowtimeModel.bulkWrite(
      showtimes.map((showtime) => ({
        updateOne: {
          filter: { seedKey: showtime.seedKey },
          update: {
            $set: {
              movieLegacyId: showtime.movieLegacyId,
              cinemaName: showtime.cinemaName,
              cinemaAddress: showtime.cinemaAddress,
              roomName: showtime.roomName,
              displayDate: showtime.displayDate,
              displayTime: showtime.displayTime,
              startTime: showtime.startTime,
              endTime: showtime.endTime,
              price: showtime.price,
              seats: showtime.seats,
            },
            $setOnInsert: {
              seedKey: showtime.seedKey,
              bookedSeats: [],
            },
          },
          upsert: true,
        },
      }))
    );

    console.log("Synced showtime seed data");
  }

  if (seedFeedbackEntries.length > 0) {
    await FeedbackModel.bulkWrite(
      seedFeedbackEntries.map((entry) => ({
        updateOne: {
          filter: { seedKey: entry.seedKey },
          update: {
            $set: {
              userId: entry.userId || null,
              fullName: entry.fullName,
              email: entry.email,
              rating: entry.rating,
              headline: entry.headline,
              message: entry.message,
              source: "seed",
            },
            $setOnInsert: {
              seedKey: entry.seedKey,
            },
          },
          upsert: true,
        },
      }))
    );

    console.log("Synced feedback seed data");
  }
};

export const ensureAdminAccount = async () => {
  const adminEmail = String(getAdminEmail() || "").trim().toLowerCase();
  const adminPassword = String(getAdminPassword() || "");

  if (!adminEmail || !adminPassword) {
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await UserModel.findOneAndUpdate(
    { email: adminEmail },
    {
      $set: {
        fullName: getAdminFullName(),
        role: "admin",
        password: hashedPassword,
      },
      $setOnInsert: {
        email: adminEmail,
      },
    },
    {
      upsert: true,
      new: true,
    }
  );

  console.log("Ensured admin account");
};
