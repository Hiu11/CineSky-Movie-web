import { Router } from "express";
import moviesController from "../controllers/movies.controller.js";

const genresRouter = Router();

genresRouter.get("/", moviesController.getGenres);

export default genresRouter;
