import { Router } from "express";
import favoritesController from "../controllers/favorites.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const favoritesRouter = Router();

favoritesRouter.get("/", requireAuth, favoritesController.getMyFavorites);
favoritesRouter.post("/:movieId", requireAuth, favoritesController.addFavorite);
favoritesRouter.delete("/:movieId", requireAuth, favoritesController.removeFavorite);

export default favoritesRouter;
