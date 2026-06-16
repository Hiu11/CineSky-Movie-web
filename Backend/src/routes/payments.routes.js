import { Router } from "express";
import paymentsController from "../controllers/payments.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const paymentsRouter = Router();

paymentsRouter.post("/mock-sessions", requireAuth, paymentsController.createMockSession);
paymentsRouter.get("/mock-sessions/:sessionId", paymentsController.getMockSession);
paymentsRouter.patch("/mock-sessions/:sessionId/confirm", paymentsController.confirmMockSession);

export default paymentsRouter;
