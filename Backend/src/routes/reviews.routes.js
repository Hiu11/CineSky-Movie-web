import { Router } from "express";
import reviewsController from "../controllers/reviews.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const reviewsRouter = Router();

reviewsRouter.get("/:movieId", reviewsController.getMovieReviews);
reviewsRouter.post("/:movieId", requireAuth, reviewsController.createReview);
reviewsRouter.delete("/:movieId", requireAuth, reviewsController.deleteMyReview);

export default reviewsRouter;
