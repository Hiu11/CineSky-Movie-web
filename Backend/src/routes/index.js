import { Router } from "express";
import authRouter from "./auth.routes.js";
import bookingsRouter from "./bookings.routes.js";
import feedbackRouter from "./feedback.routes.js";
import genresRouter from "./genres.routes.js";
import moviesRouter from "./movies.routes.js";

const rootRouter = Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/movies", moviesRouter);
rootRouter.use("/genres", genresRouter);
rootRouter.use("/bookings", bookingsRouter);
rootRouter.use("/feedback", feedbackRouter);

export default rootRouter;
