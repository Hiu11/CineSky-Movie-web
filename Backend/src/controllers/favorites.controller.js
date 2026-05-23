import MovieModel from "../models/movie.model.js";
import FavoriteModel from "../models/favorite.model.js";

const formatMovieId = (legacyId) => String(legacyId).padStart(3, "0");

const serializeFavorite = (favorite, movie) => ({
  id: favorite._id,
  movieId: formatMovieId(favorite.movieLegacyId),
  movieTitle: movie?.title || "",
  createdAt: favorite.createdAt,
  movie: movie
    ? {
        id: formatMovieId(movie.legacyId),
        title: movie.title,
        slug: movie.slug,
        poster: movie.poster,
        rating: movie.rating,
        status: movie.status,
      }
    : null,
});

const favoritesController = {
  getMyFavorites: async (req, res) => {
    try {
      const safeLimit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
      const favorites = await FavoriteModel.find({ userId: req.authUser._id })
        .sort({ createdAt: -1 })
        .limit(safeLimit);

      const movieLegacyIds = favorites.map((favorite) => favorite.movieLegacyId);
      const movies = await MovieModel.find({ legacyId: { $in: movieLegacyIds }, deletedAt: null });
      const movieMap = new Map(movies.map((movie) => [movie.legacyId, movie]));

      return res.status(200).send({
        success: true,
        message: "Get favorites successfully",
        data: favorites.map((favorite) =>
          serializeFavorite(favorite, movieMap.get(favorite.movieLegacyId))
        ),
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  addFavorite: async (req, res) => {
    try {
      if (req.authUser?.role === "admin") {
        return res.status(403).send({
          success: false,
          message: "Admin accounts cannot create public favorites",
          data: null,
        });
      }

      const movieLegacyId = Number(req.params.movieId);

      if (Number.isNaN(movieLegacyId)) {
        return res.status(400).send({
          success: false,
          message: "movieId is invalid",
          data: null,
        });
      }

      const movie = await MovieModel.findOne({ legacyId: movieLegacyId, deletedAt: null });

      if (!movie) {
        return res.status(404).send({
          success: false,
          message: "Movie not found",
          data: null,
        });
      }

      const favorite = await FavoriteModel.findOneAndUpdate(
        {
          userId: req.authUser._id,
          movieLegacyId,
        },
        {
          $setOnInsert: {
            userId: req.authUser._id,
            movieLegacyId,
          },
        },
        {
          new: true,
          upsert: true,
        }
      );

      return res.status(201).send({
        success: true,
        message: "Add favorite successfully",
        data: serializeFavorite(favorite, movie),
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  removeFavorite: async (req, res) => {
    try {
      const movieLegacyId = Number(req.params.movieId);

      if (Number.isNaN(movieLegacyId)) {
        return res.status(400).send({
          success: false,
          message: "movieId is invalid",
          data: null,
        });
      }

      const deletedFavorite = await FavoriteModel.findOneAndDelete({
        userId: req.authUser._id,
        movieLegacyId,
      });

      if (!deletedFavorite) {
        return res.status(404).send({
          success: false,
          message: "Favorite not found",
          data: null,
        });
      }

      return res.status(200).send({
        success: true,
        message: "Remove favorite successfully",
        data: null,
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },
};

export default favoritesController;
