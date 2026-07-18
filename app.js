import dotenv from "dotenv";
dotenv.config();
import winston from "winston";
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import connectDB from "./startup/db.js";
import routes from "./startup/routes.js";

const app = express();

// winston.add(winston.transports.File, { filename: "logfile.log" });

// For __dirname replacement in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

connectDB();

app.use(morgan("dev"));
app.use(cookieParser());

app.use("/uploads", express.static(join(__dirname, "uploads")));
app.use(express.static(join(__dirname, "middleware")));
app.use(express.static(join(__dirname, "public")));
app.use("/public/stylesheets", express.static(join(__dirname, "/public/stylesheets/")));
app.use("/public/images", express.static(join(__dirname, "/public/images/")));

// Routes
routes(app);

export default app;
