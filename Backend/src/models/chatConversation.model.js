import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ["user", "admin", "bot"], required: true },
    text: { type: String, required: true, trim: true },
    authorName: { type: String, default: "", trim: true },
    avatar: { type: String, default: "", trim: true },
    status: { type: String, enum: ["sent", "read"], default: "sent" },
    readAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const chatConversationSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, trim: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", default: null },
    fullName: { type: String, default: "", trim: true },
    avatar: { type: String, default: "", trim: true },
    email: { type: String, default: "", lowercase: true, trim: true },
    status: { type: String, enum: ["new", "in_progress", "closed"], default: "new" },
    lastMessage: { type: String, default: "", trim: true },
    lastMessageAt: { type: Date, default: Date.now },
    unreadByAdmin: { type: Number, default: 0 },
    unreadByUser: { type: Number, default: 0 },
    messages: [chatMessageSchema],
  },
  { timestamps: true }
);

const ChatConversationModel = mongoose.model("chat_conversations", chatConversationSchema);

export default ChatConversationModel;


