import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

export const checkAuth = asyncHandler(async (req, res, next) => {
    if (!req.headers.authorization) {
        res.status(401);
        throw new Error(`Request header doesn't contain any authorization.`);
    }

    if (!req.headers.authorization.startsWith("Bearer")) {
        res.status(401);
        throw new Error(`Request header doesn't properly use the Bearer authorization method.`);
    }

    try {
        const token = req.headers.authorization.split(" ")[1];
        console.log(token);
        const decoded = jwt.verify(token, process.env.JWT_PRIVATE);
        req.userData = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: `Authentication Failed: ${error.message}` });
    }
});
