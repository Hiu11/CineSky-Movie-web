import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { authRateLimiter, refreshRateLimiter } from "../middlewares/rate-limit.middleware.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
  validateBody,
} from "../middlewares/validation.middleware.js";

const authRouter = Router();

// Public routes — có rate limit + validation
authRouter.post("/register", authRateLimiter, validateBody(registerSchema), authController.register);
authRouter.post("/login", authRateLimiter, validateBody(loginSchema), authController.login);
authRouter.post("/forgot-password", authRateLimiter, validateBody(forgotPasswordSchema), authController.forgotPassword);
authRouter.post("/reset-password", authRateLimiter, validateBody(resetPasswordSchema), authController.resetPassword);

// OAuth
authRouter.get("/google", authController.redirectGoogle);
authRouter.get("/google/callback", authController.handleGoogleCallback);
authRouter.get("/facebook", authController.redirectFacebook);
authRouter.get("/facebook/callback", authController.handleFacebookCallback);

// Refresh token
authRouter.post("/refresh", refreshRateLimiter, authController.refreshToken);

// Protected routes
authRouter.get("/me", requireAuth, authController.getProfile);
authRouter.get("/admin/me", requireAuth, requireRole("admin"), authController.getProfile);
authRouter.post("/promotions/:promotionId/save", requireAuth, authController.savePromotion);
authRouter.delete("/promotions/:promotionId/save", requireAuth, authController.unsavePromotion);
authRouter.patch("/profile", requireAuth, validateBody(updateProfileSchema), authController.updateProfile);
authRouter.post("/profile/avatar", requireAuth, authController.uploadAvatar);
authRouter.post("/logout", requireAuth, authController.logout);

export default authRouter;
