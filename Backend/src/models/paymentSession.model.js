import mongoose from "mongoose";

const paymentSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "expired"],
      default: "pending",
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    provider: {
      type: String,
      default: "CineSky Pay",
      trim: true,
    },
    method: {
      type: String,
      default: "qr",
      trim: true,
    },
    movieId: {
      type: String,
      default: "",
      trim: true,
    },
    movieTitle: {
      type: String,
      default: "",
      trim: true,
    },
    showtimeId: {
      type: String,
      default: "",
      trim: true,
    },
    screeningDate: {
      type: String,
      default: "",
      trim: true,
    },
    seatNumbers: {
      type: [String],
      default: [],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

paymentSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 60 * 60 });

const PaymentSessionModel = mongoose.model("payment_sessions", paymentSessionSchema);

export default PaymentSessionModel;
