import { Router } from "express";
import chatController from "../controllers/chat.controller.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const chatRouter = Router();

chatRouter.post("/ai/recommend", optionalAuth, chatController.askMovieAi);
chatRouter.post("/", optionalAuth, chatController.startConversation);
chatRouter.get("/:conversationId", optionalAuth, chatController.getMyConversation);
chatRouter.post("/:conversationId/messages", optionalAuth, chatController.sendUserMessage);

export default chatRouter;
