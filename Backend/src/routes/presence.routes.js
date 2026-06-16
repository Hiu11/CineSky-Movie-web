import { Router } from "express";
import presenceController from "../controllers/presence.controller.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const presenceRouter = Router();

presenceRouter.post("/heartbeat", optionalAuth, presenceController.heartbeat);

export default presenceRouter;
