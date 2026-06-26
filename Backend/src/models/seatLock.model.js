import mongoose from "mongoose";

const seatLockSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    movieLegacyId: {
      type: Number,
      required: true,
      index: true,
    },
    showtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "showtimes",
      required: true,
      index: true,
    },
    screeningDate: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    seatNumbers: {
      type: [String],
      default: [],
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

seatLockSchema.index({ userId: 1, showtimeId: 1 }, { unique: true });

const SeatLockModel = mongoose.model("seat_locks", seatLockSchema);

export default SeatLockModel;
