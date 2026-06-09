import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    seedKey: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    headline: {
      type: String,
      default: "",
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      default: "feedback-page",
      trim: true,
    },
    supportMessages: [
      {
        sender: { type: String, enum: ["user", "admin", "bot"], default: "user" },
        text: { type: String, required: true, trim: true },
        authorName: { type: String, default: "", trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["new", "in_progress", "responded", "closed"],
      default: "new",
    },
    category: {
      type: String,
      enum: ["booking_issue", "payment", "interface", "movie_showtime", "cinema_service", "other"],
      default: "other",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    adminNotes: [
      {
        note: { type: String, required: true, trim: true },
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: "users", default: null },
        adminName: { type: String, default: "", trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    response: {
      type: String,
      default: "",
      trim: true,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    isSpam: {
      type: Boolean,
      default: false,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    history: [
      {
        action: { type: String, required: true, trim: true },
        from: { type: String, default: "", trim: true },
        to: { type: String, default: "", trim: true },
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: "users", default: null },
        adminName: { type: String, default: "", trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const FeedbackModel = mongoose.model("feedbacks", feedbackSchema);

export default FeedbackModel;
