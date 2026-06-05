import mongoose from "mongoose";

const promotionRedemptionSchema = new mongoose.Schema(
  {
    promotionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "promotions",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bookings",
      default: null,
      index: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

promotionRedemptionSchema.index({ promotionId: 1, userId: 1 });
promotionRedemptionSchema.index({ code: 1, userId: 1 });
promotionRedemptionSchema.index({ bookingId: 1, promotionId: 1 }, { unique: true, sparse: true });

const PromotionRedemptionModel = mongoose.model("promotion_redemptions", promotionRedemptionSchema);

export default PromotionRedemptionModel;
