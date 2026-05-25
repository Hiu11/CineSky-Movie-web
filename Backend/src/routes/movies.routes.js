import { Router } from "express";
import moviesController from "../controllers/movies.controller.js";

const moviesRouter = Router();

moviesRouter.get("/", moviesController.getMovies);

// Trả về cấu hình phí dịch vụ để Frontend không hardcode
moviesRouter.get("/config/booking-fees", moviesController.getBookingFees);

moviesRouter.get("/:id/showtimes", moviesController.getMovieShowtimes);
moviesRouter.get("/:id", moviesController.getMovieById);

export default moviesRouter;
