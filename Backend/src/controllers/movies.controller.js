import GenreModel from "../models/genre.model.js";
import MovieModel from "../models/movie.model.js";

const ratingClassMap = {
  C18: "t18",
  T18: "t18",
  T16: "t16",
  T13: "t13",
  K: "p-rating",
  P: "p-rating",
  NR: "p-rating",
};

const ratingDescriptionMap = {
  C18: "**C18:** Phim dành cho khán giả từ đủ 18 tuổi trở lên",
  T18: "**T18:** Phim dành cho khán giả từ đủ 18 tuổi trở lên",
  T16: "**T16:** Phim dành cho khán giả từ đủ 16 tuổi trở lên",
  T13: "**T13:** Phim dành cho khán giả từ đủ 13 tuổi trở lên",
  K: "**K:** Phim dành cho khán giả dưới 13 tuổi khi xem cùng cha mẹ hoặc người giám hộ",
  P: "**P:** Phim phổ biến, mọi lứa tuổi",
  NR: "**NR:** Chưa phân loại",
};

const serializeMovie = (movie) => ({
  id: movie.legacyId,
  slug: movie.slug,
  title: movie.title,
  poster: movie.poster,
  genres: movie.genres,
  genre: movie.genres.join(", "),
  country: movie.country,
  director: movie.director,
  duration: movie.duration,
  rating: movie.rating,
  ratingClass: ratingClassMap[movie.rating] || "p-rating",
  ratingDesc:
    ratingDescriptionMap[movie.rating] || "**NR:** Chưa phân loại",
  status: movie.status,
  release: movie.releaseDate,
  trailer: movie.trailer,
  description: movie.description,
  times: movie.showtimes.length > 0 ? movie.showtimes : ["Chưa có lịch"],
});

const buildMovieFilter = (query) => {
  const filter = {};

  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }

  if (query.search) {
    filter.title = {
      $regex: query.search.trim(),
      $options: "i",
    };
  }

  if (query.genre) {
    filter.genres = query.genre;
  }

  if (query.country) {
    filter.country = query.country;
  }

  if (query.rating) {
    filter.rating = query.rating;
  }

  return filter;
};

const moviesController = {
  getMovies: async (req, res) => {
    try {
      const filter = buildMovieFilter(req.query);
      const movies = await MovieModel.find(filter).sort({
        status: 1,
        legacyId: 1,
      });

      res.status(200).send({
        success: true,
        message: "Get movies successfully",
        data: movies.map(serializeMovie),
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  getMovieById: async (req, res) => {
    try {
      const legacyId = Number(req.params.id);

      if (Number.isNaN(legacyId)) {
        return res.status(400).send({
          success: false,
          message: "Movie id is invalid",
          data: null,
        });
      }

      const movie = await MovieModel.findOne({ legacyId });

      if (!movie) {
        return res.status(404).send({
          success: false,
          message: "Movie not found",
          data: null,
        });
      }

      return res.status(200).send({
        success: true,
        message: "Get movie successfully",
        data: serializeMovie(movie),
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  getGenres: async (req, res) => {
    try {
      const genres = await GenreModel.find().sort({ name: 1 });

      res.status(200).send({
        success: true,
        message: "Get genres successfully",
        data: genres.map((genre) => ({
          id: genre._id,
          name: genre.name,
          slug: genre.slug,
        })),
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },
};

export default moviesController;
