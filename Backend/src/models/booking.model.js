import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
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
    showtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "showtimes",
      required: true,
    },
    seatNumbers: {
      type: [String],
      default: [],
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["booked", "cancelled"],
      default: "booked",
    },
  },
  {
    timestamps: true,
  }
);

const BookingModel = mongoose.model("bookings", bookingSchema);

export default BookingModel;
