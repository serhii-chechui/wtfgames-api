import bodyparser from "body-parser";
import authRouter from "../routes/auth.js";
import gamesRouter from "../routes/games.js";
import applicationRouter from "../routes/applicatoins.js";
import usersRoute from "../routes/users.js";
import { errorHandler } from "../middleware/errorMiddleware.js";
import { application } from "express";

export default function (app) {
    // CORS: при работе с httpOnly-cookie нельзя использовать "*" —
    // браузер отклонит credentialed-запрос. Отражаем origin из allow-list
    // и разрешаем credentials.
    const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:3000,http://127.0.0.1:3000")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

    app.use((req, res, next) => {
        const origin = req.headers.origin;
        if (origin && allowedOrigins.includes(origin)) {
            res.header("Access-Control-Allow-Origin", origin);
            res.header("Vary", "Origin");
        }
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

        if (req.method === "OPTIONS") {
            res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
            return res.status(200).json({});
        }
        next();
    });

    app.use(bodyparser.urlencoded({ extended: false }));
    app.use(bodyparser.json());

    // Routes
    app.use("/api/auth", authRouter);
    app.use("/api/games", gamesRouter);
    app.use("/api/applications", applicationRouter);
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
