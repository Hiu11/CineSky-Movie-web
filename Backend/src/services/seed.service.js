import { buildMovieDetailSeed } from "../data/movieDetailSeed.js";
import seedFeedbackEntries from "../data/seedFeedback.js";
import seedMovies from "../data/seedMovies.js";
import { createShowtimesFromMovies } from "../data/seedShowtimes.js";
import FeedbackModel from "../models/feedback.model.js";
import GenreModel from "../models/genre.model.js";
import MovieModel from "../models/movie.model.js";
import ShowtimeModel from "../models/showtime.model.js";

const slugifyText = (value) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const ensureMovieSeedData = async () => {
  const moviesWithDetails = seedMovies.map((movie) => ({
    ...movie,
    ...buildMovieDetailSeed(movie),
  }));

  await MovieModel.bulkWrite(
    moviesWithDetails.map((movie) => ({
      updateOne: {
        filter: { legacyId: movie.legacyId },
        update: { $set: movie },
        upsert: true,
      },
    }))
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
