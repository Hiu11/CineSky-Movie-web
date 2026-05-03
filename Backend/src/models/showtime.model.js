import mongoose from "mongoose";

const showtimeSchema = new mongoose.Schema(
  {
    seedKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    movieLegacyId: {
      type: Number,
      required: true,
      index: true,
    },
    cinemaName: {
      type: String,
      required: true,
      trim: true,
    },
    cinemaAddress: {
      type: String,
      default: "",
      trim: true,
    },
    roomName: {
      type: String,
      required: true,
      trim: true,
    },
    displayDate: {
      type: String,
      default: "",
      trim: true,
    },
    displayTime: {
      type: String,
      default: "",
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
    bookedSeats: {
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
