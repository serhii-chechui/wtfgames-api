import { randomUUID } from "crypto";
import { logger } from "../config/logger.js";

// Attach a correlation id to each request (reusing an inbound X-Request-Id set
// by a trusted proxy, if present) and echo it back, so logs can be traced.
export const requestId = (req, res, next) => {
    const id = req.headers["x-request-id"] || randomUUID();
    req.id = id;
    res.setHeader("X-Request-Id", id);
    next();
};

// Log one structured line per completed request.
export const httpLogger = (req, res, next) => {
    const start = process.hrtime.bigint();
    res.on("finish", () => {
        const durationMs = Math.round(Number(process.hrtime.bigint() - start) / 1e6);
        logger.info("http_request", {
            reqId: req.id,
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            durationMs,
            ip: req.ip,
        });
    });
    next();
};
