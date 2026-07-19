import asyncHandler from "express-async-handler";
import User from "../models/user.js";

// RBAC check. The role is verified AUTHORITATIVELY against the DB, not the JWT:
// a token lives for up to 1 hour, so this way a user's role change or deletion
// takes effect immediately (e.g. a dismissed employee with a still-valid token
// no longer passes the role check). Requires checkAuth earlier in the chain
// (it populates req.userData).
export const requireRole = (...allowedRoles) =>
    asyncHandler(async (req, res, next) => {
        const userId = req.userData?.userId;
        if (!userId) {
            res.status(401);
            throw new Error("Authentication required.");
        }

        const user = await User.findById(userId).select("role").exec();
        if (!user) {
            res.status(401);
            throw new Error("Authentication required.");
        }

        if (!allowedRoles.includes(user.role)) {
            res.status(403);
            throw new Error("Forbidden: insufficient role.");
        }

        // Pass the current role downstream in case a handler needs it.
        req.userRole = user.role;
        next();
    });
