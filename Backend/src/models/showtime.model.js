import mongoose from "mongoose";

const showtimeSchema = new mongoose.Schema(
  {
    movieLegacyId: {
      type: Number,
      required: true,
    },
    roomName: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    seats: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const ShowtimeModel = mongoose.model("showtimes", showtimeSchema);

export default ShowtimeModel;
