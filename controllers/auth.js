import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import User from "../models/user.js";
import { sendSuccess } from "../utils/apiResponse.js";

// httpOnly cookie options for the JWT. secure/sameSite are driven by env so it
// works both in dev (http, same-origin via the CRA proxy) and in prod (https,
// possibly cross-domain: COOKIE_SECURE=true, COOKIE_SAMESITE=none).
const cookieOptions = () => ({
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAMESITE || "lax",
    path: "/",
});

const TOKEN_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour — matches the JWT expiry

// Never expose the password hash or any extra fields.
const publicUser = (user) => ({
    _id: user._id,
    email: user.email,
    role: user.role,
    firstname: user.firstname,
    lastname: user.lastname,
});

// @desc   Authenticate: sets an httpOnly cookie with the JWT
// @route  POST /api/auth/login
// @access Public
export const login = asyncHandler(async (req, res) => {
    // req.body is validated by loginSchema (see routes/auth.js): email/password
    // are non-empty strings, so no object (e.g. {"$ne": null}) can reach the
    // Mongo filter — NoSQL-injection safe (CWE-943).
    const { email, password } = req.body;

    // password has select:false in the schema — request it explicitly to verify.
    const user = await User.findOne({ email }).select("+password").exec();

    // Same message for "no user" and "wrong password" so we don't reveal whether
    // the e-mail exists (protection against user enumeration).
    if (!user) {
        res.status(401);
        throw new Error("Invalid email or password.");
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
        res.status(401);
        throw new Error("Invalid email or password.");
    }

    const token = jsonwebtoken.sign({ email: user.email, userId: user._id }, process.env.JWT_PRIVATE, {
        algorithm: "HS256",
        expiresIn: "1h",
    });

    res.cookie("token", token, { ...cookieOptions(), maxAge: TOKEN_MAX_AGE_MS });
    sendSuccess(res, { user: publicUser(user) });
});

// @desc   Current authenticated user (used to hydrate the session)
// @route  GET /api/auth/me
// @access Private (checkAuth)
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.userData.userId).select("-password").exec();
    if (!user) {
        res.status(404);
        throw new Error("User not found.");
    }
    sendSuccess(res, { user: publicUser(user) });
});

// @desc   Logout: clears the auth cookie
// @route  POST /api/auth/logout
// @access Public
export const logout = asyncHandler(async (req, res) => {
    res.clearCookie("token", cookieOptions());
    sendSuccess(res, { message: "Logged out." });
});
