import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    gender: {
      type: String,
      enum: ["", "Nam", "Nữ", "Khác"],
      default: "",
      trim: true,
    },
    birthday: {
      type: String,
      default: "",
      trim: true,
      // Phải là YYYY-MM-DD hoặc chuỗi rỗng.
      validate: {
        validator: (value) => value === "" || /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value),
        message: "Ngày sinh phải có định dạng YYYY-MM-DD (ví dụ: 1999-12-31)",
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: {
      type: String,
      default: "",
      trim: true,
    },
    membership: {
      points: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalTickets: {
        type: Number,
        default: 0,
        min: 0,
      },
      tier: {
        type: String,
        enum: ["Member", "Silver", "Gold", "Diamond"],
        default: "Member",
      },
    },
    savedPromotionIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "promotions",
      default: [],
    },
    refreshToken: {
      type: String,
      default: "",
      select: false,
      trim: true,
    },
    resetPasswordTokenHash: {
      type: String,
      default: "",
      select: false,
      trim: true,
    },
    resetPasswordExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("users", userSchema);

export default UserModel;
