export const errorHandler = (err, req, res, next) => {
    // Order: explicit err.status (e.g. from the 404 handler) → an already-set
    // res.status() (our throws call res.status(4xx) before throwing) → else 500.
    const statusCode = err.status || err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
    console.error(err.message);
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};
