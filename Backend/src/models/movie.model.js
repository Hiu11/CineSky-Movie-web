import mongoose from "mongoose";

const castMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const trailerFactSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: "",
      trim: true,
    },
    value: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const trailerPanelSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: "",
      trim: true,
    },
    title: {
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
    _id: false,
  }
);

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
    statusOrder: {
      type: Number,
      default: 0,
    },
    catalogOrder: {
      type: Number,
      default: 999,
    },
    heroOrder: {
      type: Number,
      default: null,
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
    cast: {
      type: [castMemberSchema],
      default: [],
    },
    gallery: {
      type: [String],
      default: [],
    },
    trailerFacts: {
      type: [trailerFactSchema],
      default: [],
    },
    trailerPanel: {
      type: trailerPanelSchema,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const MovieModel = mongoose.model("movies", movieSchema);

export default MovieModel;
