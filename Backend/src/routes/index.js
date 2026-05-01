import { Router } from "express";
import genresRouter from "./genres.routes.js";
import moviesRouter from "./movies.routes.js";

const rootRouter = Router();

rootRouter.use("/movies", moviesRouter);
rootRouter.use("/genres", genresRouter);

export default rootRouter;
