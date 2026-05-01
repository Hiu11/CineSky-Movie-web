import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    legacyId: {
      type: Number,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    poster: {
      type: String,
      required: true,
      trim: true,
    },
    genres: {
      type: [String],
      default: [],
    },
    country: {
      type: String,
      default: "",
      trim: true,
    },
    director: {
      type: String,
      default: "",
      trim: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    rating: {
      type: String,
      default: "P",
      trim: true,
    },
    status: {
      type: String,
      enum: ["now-showing", "coming-soon"],
      default: "now-showing",
    },
    showtimes: {
      type: [String],
      default: [],
    },
    releaseDate: {
      type: String,
      default: "",
      trim: true,
    },
    trailer: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const MovieModel = mongoose.model("movies", movieSchema);

export default MovieModel;
