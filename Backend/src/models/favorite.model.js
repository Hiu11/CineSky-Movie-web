import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

favoriteSchema.index({ userId: 1, movieLegacyId: 1 }, { unique: true });

const FavoriteModel = mongoose.model("favorites", favoriteSchema);

export default FavoriteModel;
