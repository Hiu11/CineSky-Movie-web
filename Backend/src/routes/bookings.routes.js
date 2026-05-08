import { Router } from "express";
import bookingsController from "../controllers/bookings.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const bookingsRouter = Router();

bookingsRouter.get("/history", requireAuth, bookingsController.getBookingHistory);
bookingsRouter.post("/", requireAuth, bookingsController.createBooking);

export default bookingsRouter;
