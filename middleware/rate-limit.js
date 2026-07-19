import rateLimit from "express-rate-limit";

// Throttle brute-force / credential-stuffing attempts on the login endpoint.
// Keyed by client IP (see app.set("trust proxy", 1)); returns 429 when exceeded.
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // attempts per IP per window
    standardHeaders: true, // expose RateLimit-* headers
    legacyHeaders: false,
    message: { success: false, error: { message: "Too many login attempts. Please try again later." } },
});
