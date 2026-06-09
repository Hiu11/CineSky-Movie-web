import { Router } from "express";
import feedbackController from "../controllers/feedback.controller.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const feedbackRouter = Router();

feedbackRouter.get("/", feedbackController.getFeedbackEntries);
feedbackRouter.post("/", optionalAuth, feedbackController.createFeedbackEntry);
feedbackRouter.get("/:feedbackId/support-messages", optionalAuth, feedbackController.getSupportMessages);
feedbackRouter.post("/:feedbackId/support-messages", optionalAuth, feedbackController.addSupportMessage);

export default feedbackRouter;
