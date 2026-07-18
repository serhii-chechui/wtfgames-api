import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import User from "../models/user.js";

// Опции httpOnly-cookie с JWT. secure/sameSite управляются через env,
// чтобы работать и в dev (http, same-origin через CRA-прокси), и в prod
// (https, возможно кросс-доменно: COOKIE_SECURE=true, COOKIE_SAMESITE=none).
const cookieOptions = () => ({
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAMESITE || "lax",
    path: "/",
});

const TOKEN_MAX_AGE_MS = 60 * 60 * 1000; // 1 час — совпадает со сроком JWT

// Никогда не отдаём наружу хеш пароля и лишние поля.
const publicUser = (user) => ({
    _id: user._id,
    email: user.email,
    role: user.role,
    firstname: user.firstname,
    lastname: user.lastname,
});

// @desc   Аутентификация: ставит httpOnly-cookie с JWT
// @route  POST /api/auth/login
// @access Public
export const login = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).exec();

    // Единое сообщение для «нет юзера» и «неверный пароль», чтобы не
    // раскрывать существование e-mail (защита от user enumeration).
    if (!user) {
        res.status(401);
        throw new Error("Invalid email or password.");
    }

    const passwordMatches = await bcrypt.compare(req.body.password || "", user.password);
    if (!passwordMatches) {
        res.status(401);
        throw new Error("Invalid email or password.");
    }

    const token = jsonwebtoken.sign({ email: user.email, userId: user._id }, process.env.JWT_PRIVATE, {
        algorithm: "HS256",
        expiresIn: "1h",
    });

    res.cookie("token", token, { ...cookieOptions(), maxAge: TOKEN_MAX_AGE_MS });
    res.status(200).json({ message: "Authentication completed!", user: publicUser(user) });
});

// @desc   Текущий аутентифицированный пользователь (для гидратации сессии)
// @route  GET /api/auth/me
// @access Private (checkAuth)
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.userData.userId).select("-password").exec();
    if (!user) {
        res.status(404);
        throw new Error("User not found.");
    }
    res.status(200).json({ user: publicUser(user) });
});

// @desc   Выход: очищает auth-cookie
// @route  POST /api/auth/logout
// @access Public
export const logout = asyncHandler(async (req, res) => {
    res.clearCookie("token", cookieOptions());
    res.status(200).json({ message: "Logged out." });
});
