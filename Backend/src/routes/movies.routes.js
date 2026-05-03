import { Router } from "express";
import moviesController from "../controllers/movies.controller.js";

const moviesRouter = Router();

moviesRouter.get("/", moviesController.getMovies);
moviesRouter.get("/:id/showtimes", moviesController.getMovieShowtimes);
moviesRouter.get("/:id", moviesController.getMovieById);

export default moviesRouter;
