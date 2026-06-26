import mongoose from "mongoose";

const presenceSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
      index: true,
    },
    fullName: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      default: "guest",
      trim: true,
    },
    currentPath: {
      type: String,
      default: "/",
      trim: true,
    },
    userAgent: {
      type: String,
      default: "",
      trim: true,
    },
    ipAddress: {
      type: String,
      default: "",
      trim: true,
    },
    firstSeenAt: {
      type: Date,
      default: Date.now,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

presenceSchema.index({ lastSeenAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

const PresenceModel = mongoose.model("presence", presenceSchema);

export default PresenceModel;
