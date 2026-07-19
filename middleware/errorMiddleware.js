import { logger } from "../config/logger.js";

export const errorHandler = (err, req, res, next) => {
    // Order: explicit err.status (e.g. from the 404 handler) → an already-set
    // res.status() (our throws call res.status(4xx) before throwing) → else 500.
    let statusCode = err.status || err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
    let message = err.message;

    // Mongoose input errors are client problems, not server faults → 400.
    if (err.name === "ValidationError") {
        statusCode = 400;
    } else if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid value for '${err.path}'.`;
    } else if (err.code === 11000) {
        // Duplicate unique key (e.g. Title). Generic message — do not echo the
        // raw driver error, which exposes the collection and index names.
        statusCode = 409;
        message = "A resource with the same unique field already exists.";
    }

    logger.error(err.message, { reqId: req.id, status: statusCode, stack: err.stack });
    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};
