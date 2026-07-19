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
    }

    console.error(err.message);
    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};
