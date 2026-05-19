import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: ["hero", "member", "combo"],
      required: true,
      index: true,
    },
    tier: {
      type: String,
      enum: ["Silver", "Gold", "Diamond", ""],
      default: "",
      trim: true,
    },
    tag: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const PromotionModel = mongoose.model("promotions", promotionSchema);

export default PromotionModel;
