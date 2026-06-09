import FeedbackModel from "../models/feedback.model.js";
import UserModel from "../models/user.model.js";
import { buildNonAdminFeedbackFilter, mergeMongoFilters } from "../utils/adminFilters.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const feedbackCategories = new Set(["booking_issue", "payment", "interface", "movie_showtime", "cinema_service", "other"]);
const feedbackPriorities = new Set(["low", "medium", "high", "urgent"]);

const serializeSupportMessages = (messages = []) =>
  messages.map((message) => ({
    id: message._id || `${message.sender}-${message.createdAt?.getTime?.() || Date.now()}`,
    sender: message.sender || "user",
    text: message.text || "",
    authorName: message.authorName || "",
    createdAt: message.createdAt || null,
  }));

const buildHeadline = (headline = "", message = "") => {
  const trimmedHeadline = String(headline).trim();

  if (trimmedHeadline) {
    return trimmedHeadline;
  }

  const trimmedMessage = String(message).trim().replace(/\s+/g, " ");

  if (!trimmedMessage) {
    return "Phản hồi từ người dùng";
  }

  const preview = trimmedMessage.split(" ").slice(0, 8).join(" ");
  return preview.length < trimmedMessage.length ? `${preview}...` : preview;
};

const serializeFeedback = (feedback) => ({
  id: feedback._id,
  userId: feedback.userId || null,
  fullName: feedback.fullName,
  email: feedback.email,
  rating: Math.max(1, Math.min(5, Number(feedback.rating) || 1)),
  headline: buildHeadline(feedback.headline, feedback.message),
  message: feedback.message,
  source: feedback.source || "feedback-page",
  status: feedback.status || "new",
  category: feedback.category || "other",
  priority: feedback.priority || "medium",
  supportMessages: serializeSupportMessages(feedback.supportMessages || []),
  response: feedback.response || "",
  respondedAt: feedback.respondedAt || null,
  createdAt: feedback.createdAt,
});

const feedbackController = {
  getFeedbackEntries: async (req, res) => {
    try {
      const safeLimit = Math.min(Math.max(Number(req.query.limit) || 6, 1), 12);
      const page = Math.max(Number(req.query.page) || 1, 1);
      const skip = (page - 1) * safeLimit;
      const adminUsers = await UserModel.find({ role: "admin" }).select("_id email");
      const filter = mergeMongoFilters(
        { isHidden: { $ne: true }, isSpam: { $ne: true }, source: { $ne: "support-chat" } },
        buildNonAdminFeedbackFilter(adminUsers)
      );
      const [feedbackEntries, totalItems] = await Promise.all([
        FeedbackModel.find(filter)
        .sort({ createdAt: -1 })
          .skip(skip)
          .limit(safeLimit),
        FeedbackModel.countDocuments(filter),
      ]);

      return res.status(200).send({
        success: true,
        message: "Get feedback successfully",
        data: feedbackEntries.map(serializeFeedback),
        pagination: {
          page,
          limit: safeLimit,
          totalItems,
          totalPages: Math.max(Math.ceil(totalItems / safeLimit), 1),
        },
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  createFeedbackEntry: async (req, res) => {
    try {
      const {
        fullName = "",
        email = "",
        rating = 0,
        headline = "",
        message = "",
        initialSupportMessage = "",
        source = "feedback-page",
        category = "other",
        priority = "medium",
      } = req.body || {};

      const trimmedFullName = String(fullName).trim();
      const normalizedEmail = String(email).trim().toLowerCase();
      const trimmedMessage = String(message).trim();
      const trimmedInitialSupportMessage = String(initialSupportMessage || "").trim();
      const safeRating = Number(rating);

      if (req.authUser?.role === "admin") {
        return res.status(403).send({
          success: false,
          message: "Admin accounts can reply to feedback from the admin flow, not create public feedback",
          data: null,
        });
      }

      if (!trimmedFullName || !normalizedEmail || !trimmedMessage) {
        return res.status(400).send({
          success: false,
          message: "fullName, email and message are required",
          data: null,
        });
      }

      if (!emailPattern.test(normalizedEmail)) {
        return res.status(400).send({
          success: false,
          message: "Email is invalid",
          data: null,
        });
      }

      if (!Number.isInteger(safeRating) || safeRating < 1 || safeRating > 5) {
        return res.status(400).send({
          success: false,
          message: "Rating must be an integer between 1 and 5",
          data: null,
        });
      }

      const feedback = await FeedbackModel.create({
        userId: req.authUser?._id || null,
        fullName: trimmedFullName,
        email: normalizedEmail,
        rating: safeRating,
        headline: buildHeadline(headline, trimmedMessage),
        message: trimmedMessage,
        source: String(source || "feedback-page").trim() || "feedback-page",
        category: feedbackCategories.has(category) ? category : "other",
        priority: feedbackPriorities.has(priority) ? priority : "medium",
        supportMessages:
          source === "support-chat"
            ? [{ sender: "user", text: trimmedInitialSupportMessage || trimmedMessage, authorName: trimmedFullName }]
            : [],
      });

      return res.status(201).send({
        success: true,
        message: "Create feedback successfully",
        data: serializeFeedback(feedback),
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  getSupportMessages: async (req, res) => {
    try {
      const feedback = await FeedbackModel.findById(req.params.feedbackId);

      if (!feedback || feedback.source !== "support-chat") {
        return res.status(404).send({ success: false, message: "Support chat not found", data: null });
      }

      const requestedEmail = String(req.query.email || "").trim().toLowerCase();
      const isAdmin = req.authUser?.role === "admin";

      if (!isAdmin && requestedEmail !== feedback.email) {
        return res.status(403).send({ success: false, message: "Email does not match this chat", data: null });
      }

      return res.status(200).send({
        success: true,
        message: "Get support messages successfully",
        data: serializeSupportMessages(feedback.supportMessages || []),
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },

  addSupportMessage: async (req, res) => {
    try {
      const feedback = await FeedbackModel.findById(req.params.feedbackId);

      if (!feedback || feedback.source !== "support-chat") {
        return res.status(404).send({ success: false, message: "Support chat not found", data: null });
      }

      const text = String(req.body?.text || "").trim();
      const requestedEmail = String(req.body?.email || "").trim().toLowerCase();
      const isAdmin = req.authUser?.role === "admin";

      if (!text) {
        return res.status(400).send({ success: false, message: "Message is required", data: null });
      }

      if (!isAdmin && requestedEmail !== feedback.email) {
        return res.status(403).send({ success: false, message: "Email does not match this chat", data: null });
      }

      feedback.supportMessages.push({
        sender: isAdmin ? "admin" : "user",
        text,
        authorName: isAdmin ? req.authUser.fullName || req.authUser.email || "Admin" : feedback.fullName,
      });

      if (isAdmin) {
        feedback.status = feedback.status === "closed" ? "responded" : "in_progress";
      } else {
        feedback.status = "new";
        feedback.priority = feedback.priority === "urgent" ? "urgent" : "high";
      }

      await feedback.save();

      return res.status(200).send({
        success: true,
        message: "Send support message successfully",
        data: serializeFeedback(feedback),
      });
    } catch (error) {
      return res.status(500).send({
        success: false,
        message: error.message || "Internal server error",
        data: null,
      });
    }
  },
};

export default feedbackController;
