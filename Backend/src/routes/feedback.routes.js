import { Router } from "express";
import feedbackController from "../controllers/feedback.controller.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const feedbackRouter = Router();

feedbackRouter.get("/", feedbackController.getFeedbackEntries);
feedbackRouter.post("/", optionalAuth, feedbackController.createFeedbackEntry);

export default feedbackRouter;
