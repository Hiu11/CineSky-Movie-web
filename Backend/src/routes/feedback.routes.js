import { Router } from "express";
import feedbackController from "../controllers/feedback.controller.js";

const feedbackRouter = Router();

feedbackRouter.get("/", feedbackController.getFeedbackEntries);
feedbackRouter.post("/", feedbackController.createFeedbackEntry);

export default feedbackRouter;
