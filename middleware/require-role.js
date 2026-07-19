import asyncHandler from "express-async-handler";
import User from "../models/user.js";

// RBAC-проверка. Роль проверяется АВТОРИТЕТНО по БД, а не по JWT: токен живёт
// до 1 часа, а так изменение или удаление пользователя действует немедленно
// (например, у уволенного сотрудника с ещё валидным токеном роль уже не пройдёт).
// Требует, чтобы ранее в цепочке отработал checkAuth (заполняет req.userData).
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

        // Прокидываем актуальную роль дальше на случай, если хендлеру она нужна.
        req.userRole = user.role;
        next();
    });
