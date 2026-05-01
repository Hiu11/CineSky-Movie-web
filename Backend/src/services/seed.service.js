import seedMovies from "../data/seedMovies.js";
import GenreModel from "../models/genre.model.js";
import MovieModel from "../models/movie.model.js";

const slugifyText = (value) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const ensureMovieSeedData = async () => {
  const movieCount = await MovieModel.countDocuments();

  if (movieCount === 0) {
    await MovieModel.insertMany(seedMovies);
    console.log("Seeded initial movie data");
  }

  const genres = Array.from(
    new Set(seedMovies.flatMap((movie) => movie.genres))
  ).map((name) => ({
    name,
    slug: slugifyText(name),
  }));

  for (const genre of genres) {
    await GenreModel.updateOne(
      { slug: genre.slug },
      { $setOnInsert: genre },
      { upsert: true }
    );
  }
};
