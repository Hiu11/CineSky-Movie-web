import { Router } from "express";
import adminController from "../controllers/admin.controller.js";
import chatController from "../controllers/chat.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("admin"));

adminRouter.get("/overview", adminController.getDashboardOverview);
adminRouter.get("/analytics", adminController.getDashboardAnalytics);
adminRouter.get("/activity", adminController.getActivity);
adminRouter.get("/users", adminController.getUsers);
adminRouter.get("/bookings", adminController.getBookings);
adminRouter.get("/chats", chatController.getAdminConversations);
adminRouter.get("/chats/:conversationId", chatController.getAdminConversation);
adminRouter.post("/chats/:conversationId/messages", chatController.sendAdminMessage);
adminRouter.get("/promotions", adminController.getPromotions);
adminRouter.post("/promotions", adminController.createPromotion);
adminRouter.put("/promotions/:promotionId", adminController.updatePromotion);
adminRouter.delete("/promotions/:promotionId", adminController.deletePromotion);
adminRouter.get("/feedback", adminController.getFeedbackEntries);
adminRouter.patch("/feedback/:feedbackId", adminController.updateFeedbackEntry);
adminRouter.delete("/feedback/:feedbackId", adminController.deleteFeedbackEntry);
adminRouter.get("/tickets/lookup", adminController.lookupTicket);
adminRouter.patch("/tickets/:ticketCode/check-in", adminController.checkInTicket);
adminRouter.get("/movies/trash", adminController.getDeletedMovies);
adminRouter.get("/tmdb/search", adminController.searchTmdbMovie);
adminRouter.post("/uploads/poster", adminController.uploadPoster);
adminRouter.post("/movies", adminController.createMovie);
adminRouter.put("/movies/:movieId", adminController.updateMovie);
adminRouter.patch("/movies/:movieId/restore", adminController.restoreMovie);
adminRouter.delete("/movies/:movieId", adminController.deleteMovie);
adminRouter.get("/users/:userId/activity", adminController.getUserActivity);
adminRouter.patch("/users/:userId/role", adminController.updateUserRole);

export default adminRouter;
