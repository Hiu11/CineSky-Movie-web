import FeedbackModel from "../models/feedback.model.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  response: feedback.response || "",
  respondedAt: feedback.respondedAt || null,
  createdAt: feedback.createdAt,
});

const feedbackController = {
  getFeedbackEntries: async (req, res) => {
    try {
      const safeLimit = Math.min(Math.max(Number(req.query.limit) || 6, 1), 12);
      const feedbackEntries = await FeedbackModel.find({ isHidden: { $ne: true }, isSpam: { $ne: true } })
        .sort({ createdAt: -1 })
        .limit(safeLimit);

      return res.status(200).send({
        success: true,
        message: "Get feedback successfully",
        data: feedbackEntries.map(serializeFeedback),
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
        source = "feedback-page",
      } = req.body || {};

      const trimmedFullName = String(fullName).trim();
      const normalizedEmail = String(email).trim().toLowerCase();
      const trimmedMessage = String(message).trim();
      const safeRating = Number(rating);

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
};

export default feedbackController;
