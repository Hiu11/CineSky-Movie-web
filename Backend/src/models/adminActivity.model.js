import mongoose from "mongoose";

const adminActivitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      default: "",
      trim: true,
    },
    entityType: {
      type: String,
      default: "",
      trim: true,
    },
    entityId: {
      type: String,
      default: "",
      trim: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    adminName: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const AdminActivityModel = mongoose.model("admin_activities", adminActivitySchema);

export default AdminActivityModel;
