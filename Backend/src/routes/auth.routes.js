import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/reset-password", authController.resetPassword);
authRouter.get("/google", authController.redirectGoogle);
authRouter.get("/google/callback", authController.handleGoogleCallback);
authRouter.get("/facebook", authController.redirectFacebook);
authRouter.get("/facebook/callback", authController.handleFacebookCallback);
authRouter.post("/refresh", authController.refreshToken);
authRouter.get("/me", requireAuth, authController.getProfile);
authRouter.get("/admin/me", requireAuth, requireRole("admin"), authController.getProfile);
authRouter.patch("/profile", requireAuth, authController.updateProfile);
authRouter.post("/profile/avatar", requireAuth, authController.uploadAvatar);
authRouter.post("/logout", requireAuth, authController.logout);

export default authRouter;
