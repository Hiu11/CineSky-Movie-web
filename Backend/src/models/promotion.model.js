import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: ["hero", "member", "combo", "genre", "ticket"],
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
    code: {
      type: String,
      default: undefined,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true,
      set: (value) => {
        const code = String(value || "").trim().toUpperCase();
        return code || undefined;
      },
    },
    discountType: {
      type: String,
      enum: ["fixed", "percent", "combo_price", "free_ticket"],
      default: "fixed",
    },
    discountValue: {
      type: Number,
      default: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    requiredPoints: {
      type: Number,
      default: 0,
    },
    eligibleTiers: {
      type: [String],
      enum: ["Member", "Silver", "Gold", "Diamond"],
      default: [],
    },
    applicableGenres: {
      type: [String],
      default: [],
    },
    applicableComboIds: {
      type: [String],
      default: [],
    },
    applicableWeekdays: {
      type: [Number],
      default: [],
      validate: {
        validator: (days = []) => days.every((day) => Number.isInteger(day) && day >= 0 && day <= 6),
        message: "Weekdays must be numbers from 0 to 6",
      },
    },
    maxUsesPerUser: {
      type: Number,
      default: 1,
    },
    totalUsageLimit: {
      type: Number,
      default: 0,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    memberOnly: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String,
      enum: ["slate", "silver", "gold", "diamond", "rose", "emerald", "sky", "violet"],
      default: "slate",
    },
    startsAt: {
      type: Date,
      default: null,
    },
    endsAt: {
      type: Date,
      default: null,
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
    seedVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const PromotionModel = mongoose.model("promotions", promotionSchema);

export default PromotionModel;
