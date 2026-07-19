import { Router } from "express";
import { getAllUsers, getUserById, createUser, removeUserById } from "../controllers/users.js";
import { checkAuth } from "../middleware/check-auth.js";
import { requireRole } from "../middleware/require-role.js";

const router = Router();

// Управление пользователями доступно только аутентифицированным
// пользователям админ-панели. Первый пользователь создаётся через seed-скрипт.
// Просмотр — owner и admin; создание/удаление учёток — только owner.
router
    .route("/")
    .get(checkAuth, requireRole("owner", "admin"), getAllUsers)
    .post(checkAuth, requireRole("owner"), createUser);
router
    .route("/:id")
    .get(checkAuth, requireRole("owner", "admin"), getUserById)
    .delete(checkAuth, requireRole("owner"), removeUserById);

export default router;
