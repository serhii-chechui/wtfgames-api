import bodyparser from "body-parser";
import authRouter from "../routes/auth.js";
import gamesRouter from "../routes/games.js";
import usersRoute from "../routes/users.js";
import { errorHandler } from "../middleware/errorMiddleware.js";

export default function (app) {
    // CORS headers
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "*");

        if (req.method === "OPTIONS") {
            res.header("Access-Control-Allow-Methods", "*");
            return res.status(200).json({});
        }
        next();
    });

    app.use(bodyparser.urlencoded({ extended: false }));
    app.use(bodyparser.json());

    // Routes
    app.use("/api/auth", authRouter);
    app.use("/api/games", gamesRouter);
    app.use("/api/users", usersRoute);

    // 404 handler
    app.use((req, res, next) => {
        const error = new Error("Not found!");
        error.status = 404;
        error.message = "Not found!";
        next(error);
    });

    // Global error handler
    app.use(errorHandler);
}
