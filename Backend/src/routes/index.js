import { Router } from "express";
import adminRouter from "./admin.routes.js";
import authRouter from "./auth.routes.js";
import bookingsRouter from "./bookings.routes.js";
import chatRouter from "./chat.routes.js";
import favoritesRouter from "./favorites.routes.js";
import feedbackRouter from "./feedback.routes.js";
import genresRouter from "./genres.routes.js";
import moviesRouter from "./movies.routes.js";
import notificationsRouter from "./notifications.routes.js";
import paymentsRouter from "./payments.routes.js";
import promotionsRouter from "./promotions.routes.js";
import reviewsRouter from "./reviews.routes.js";

const rootRouter = Router();

rootRouter.use("/admin", adminRouter);
rootRouter.use("/auth", authRouter);
rootRouter.use("/movies", moviesRouter);
rootRouter.use("/genres", genresRouter);
rootRouter.use("/bookings", bookingsRouter);
rootRouter.use("/chats", chatRouter);
rootRouter.use("/feedback", feedbackRouter);
rootRouter.use("/favorites", favoritesRouter);
rootRouter.use("/reviews", reviewsRouter);
rootRouter.use("/notifications", notificationsRouter);
rootRouter.use("/payments", paymentsRouter);
rootRouter.use("/promotions", promotionsRouter);

export default rootRouter;
