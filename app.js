import express from "express";
import path from "path";
import morgan from "morgan";
import bodyparser from "body-parser";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { errorHandler } from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";

import gamesRouter from "./routes/GamesRouter.js";
// import mainPageRoute from "./routes/mian-page.js";
import categoriesRoute from "./routes/categories.js";
// import productsRoute from "./routes/products.js";
import usersRoute from "./routes/users.js";
// import ordersRoute from "./routes/orders.js";
// import giftCertificatesRoute from "./routes/gift-certificate.js";

dotenv.config();

const app = express();

// For __dirname replacement in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

connectDB();

app.use(morgan("dev"));

app.use("/uploads", express.static(join(__dirname, "uploads")));
app.use(express.static(join(__dirname, "middleware")));
app.use(express.static(join(__dirname, "public")));
app.use("/public/stylesheets", express.static(join(__dirname, "/public/stylesheets/")));
app.use("/public/images", express.static(join(__dirname, "/public/images/")));

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
// app.use("/main", mainPageRoute);
app.use("/api/games", gamesRouter);
app.use("/api/categories", categoriesRoute);
// app.use("/api/gift-certificates", giftCertificatesRoute);
app.use("/api/users", usersRoute);
// app.use("/api/products", productsRoute);
// app.use("/api/orders", ordersRoute);

// 404 handler
app.use((req, res, next) => {
    const error = new Error("Not found!");
    error.status = 404;
    error.message = "Not found!";
    next(error);
});

// Global error handler
app.use(errorHandler);

export default app;
