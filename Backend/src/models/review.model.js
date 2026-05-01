import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    movieLegacyId: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const ReviewModel = mongoose.model("reviews", reviewSchema);

export default ReviewModel;
