import mongoose from "mongoose";
import MovieModel from "../models/movie.model.js";
import ReviewModel from "../models/review.model.js";
import UserModel from "../models/user.model.js";

const formatMovieId = (legacyId) => String(legacyId).padStart(3, "0");

const serializeReview = (review) => ({
  id: review._id,
  movieId: formatMovieId(review.movieLegacyId),
  rating: review.rating,
  content: review.content,
  createdAt: review.createdAt,
  updatedAt: review.updatedAt,
  user: review.userId
    ? {
        id: review.userId._id,
        fullName: review.userId.fullName,
        email: review.userId.email,
        avatar: review.userId.avatar || "",
      }
    : null,
});

const reviewsController = {
  getMovieReviews: async (req, res) => {
    try {
      const movieLegacyId = Number(req.params.movieId);
      const safeLimit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 30);

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

      const adminUsers = await UserModel.find({ role: "admin" }).select("_id");
      const reviews = await ReviewModel.find({
        movieLegacyId,
        userId: { $nin: adminUsers.map((user) => user._id) },
      })
        .populate("userId", "fullName email avatar")
        .sort({ createdAt: -1 })
        .limit(safeLimit);

      return res.status(200).send({
        success: true,
        message: "Get reviews successfully",
        data: reviews.map(serializeReview),
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  createReview: async (req, res) => {
    try {
      if (req.authUser?.role === "admin") {
        return res.status(403).send({
          success: false,
          message: "Admin accounts cannot create public reviews",
          data: null,
        });
      }

      const movieLegacyId = Number(req.params.movieId);
      const rating = Number(req.body?.rating);
      const content = String(req.body?.content || "").trim();

      if (Number.isNaN(movieLegacyId)) {
        return res.status(400).send({
          success: false,
          message: "movieId is invalid",
          data: null,
        });
      }

      if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
        return res.status(400).send({
          success: false,
          message: "Rating must be an integer between 1 and 10",
          data: null,
        });
      }

      if (!content) {
        return res.status(400).send({
          success: false,
          message: "Review content is required",
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

      const review = await ReviewModel.findOneAndUpdate(
        {
          userId: req.authUser._id,
          movieLegacyId,
        },
        {
          $set: {
            rating,
            content,
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      ).populate("userId", "fullName email avatar");

      return res.status(201).send({
        success: true,
        message: "Create review successfully",
        data: serializeReview(review),
      });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).send({
          success: false,
          message: error.message,
          data: null,
        });
      }

      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  deleteMyReview: async (req, res) => {
    try {
      const movieLegacyId = Number(req.params.movieId);

      if (Number.isNaN(movieLegacyId)) {
        return res.status(400).send({
          success: false,
          message: "movieId is invalid",
          data: null,
        });
      }

      const deletedReview = await ReviewModel.findOneAndDelete({
        userId: req.authUser._id,
        movieLegacyId,
      });

      if (!deletedReview) {
        return res.status(404).send({
          success: false,
          message: "Review not found",
          data: null,
        });
      }

      return res.status(200).send({
        success: true,
        message: "Delete review successfully",
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

export default reviewsController;
