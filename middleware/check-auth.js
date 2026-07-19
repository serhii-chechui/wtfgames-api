import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

// The token comes from the httpOnly cookie (primary path for the admin panel) or
// from the Authorization: Bearer <token> header (fallback, e.g. server-to-server).
const extractToken = (req) => {
    if (req.cookies && req.cookies.token) return req.cookies.token;

    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) return header.split(" ")[1];

    return null;
};

export const checkAuth = asyncHandler(async (req, res, next) => {
    const token = extractToken(req);

    if (!token) {
        res.status(401);
        throw new Error("Authentication required.");
    }

    try {
        req.userData = jwt.verify(token, process.env.JWT_PRIVATE);
        next();
    } catch (error) {
        res.status(401);
        throw new Error(`Authentication failed: ${error.message}`);
    }
});
