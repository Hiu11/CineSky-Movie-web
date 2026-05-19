import { Router } from "express";
import promotionsController from "../controllers/promotions.controller.js";

const promotionsRouter = Router();

promotionsRouter.get("/", promotionsController.getPromotions);

export default promotionsRouter;
