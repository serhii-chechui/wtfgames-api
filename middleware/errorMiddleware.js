export const errorHandler = (err, req, res, next) => {
    // Порядок: явный err.status (напр. из 404-обработчика) → уже выставленный
    // res.status() (наши throw'ы делают res.status(4xx) до throw) → иначе 500.
    const statusCode = err.status || err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
    console.error(err.message);
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};
