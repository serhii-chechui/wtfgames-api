import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

// Токен берём из httpOnly-cookie (основной способ для админ-панели) либо из
// заголовка Authorization: Bearer <token> (запасной путь, напр. server-to-server).
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
