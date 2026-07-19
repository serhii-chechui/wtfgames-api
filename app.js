import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import routes from "./startup/routes.js";
import { requestId, httpLogger } from "./middleware/logging.js";

// This module builds and exports the Express app only — no side effects (env
// validation and the DB connection live in bin/www). That keeps the app
// importable in tests without touching a real database.
const app = express();

// Behind a single reverse proxy (nginx) in production, so req.ip reflects the
// real client (needed for correct logging and rate limiting).
app.set("trust proxy", 1);

// For __dirname replacement in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Security headers. crossOriginResourcePolicy is relaxed to "cross-origin" so
// images served from /uploads can be loaded by the frontends on other origins;
// JSON API responses are governed by CORS, which helmet does not affect.
app.use(requestId);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(httpLogger);
app.use(cookieParser());

app.use("/uploads", express.static(join(__dirname, "uploads")));
app.use(express.static(join(__dirname, "public")));
app.use("/public/stylesheets", express.static(join(__dirname, "/public/stylesheets/")));
app.use("/public/images", express.static(join(__dirname, "/public/images/")));

// Routes
routes(app);

export default app;
