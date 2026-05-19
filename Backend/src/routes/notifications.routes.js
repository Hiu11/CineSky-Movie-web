import { Router } from "express";
import notificationsController from "../controllers/notifications.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get("/", notificationsController.getMyNotifications);
notificationsRouter.get("/unread-count", notificationsController.getUnreadCount);
notificationsRouter.patch("/read-all", notificationsController.markAllAsRead);
notificationsRouter.patch("/:notificationId/read", notificationsController.markAsRead);

export default notificationsRouter;
