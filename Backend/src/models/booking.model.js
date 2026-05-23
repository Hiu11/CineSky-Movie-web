import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    customerName: {
      type: String,
      default: "",
      trim: true,
    },
    customerEmail: {
      type: String,
      default: "",
      trim: true,
    },
    ticketCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
      index: true,
    },
    screeningDate: {
      type: String,
      default: "",
      trim: true,
    },
    screeningDateLabel: {
      type: String,
      default: "",
      trim: true,
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
    seatNumbers: {
      type: [String],
      default: [],
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["bank", "card", "wallet", "counter"],
      default: "bank",
    },
    paymentProvider: {
      type: String,
      default: "",
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ["mock_paid", "refunded"],
      default: "mock_paid",
    },
    paymentReference: {
      type: String,
      default: "",
      trim: true,
    },
    isTestBooking: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["booked", "used", "cancelled", "expired"],
      default: "booked",
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelReason: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const BookingModel = mongoose.model("bookings", bookingSchema);

export default BookingModel;
