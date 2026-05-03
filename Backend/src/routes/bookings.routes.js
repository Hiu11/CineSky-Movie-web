import { Router } from "express";
import bookingsController from "../controllers/bookings.controller.js";

const bookingsRouter = Router();

bookingsRouter.get("/history", bookingsController.getBookingHistory);
bookingsRouter.post("/", bookingsController.createBooking);

export default bookingsRouter;
