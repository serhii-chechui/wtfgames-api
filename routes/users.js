import { Router } from "express";
import { getAllUsers, getUserById, createUser, removeUserById } from "../controllers/users.js";
import { checkAuth } from "../middleware/check-auth.js";

const router = Router();

// Управление пользователями доступно только аутентифицированным
// пользователям админ-панели. Первый пользователь создаётся через seed-скрипт.
router.route("/").get(checkAuth, getAllUsers).post(checkAuth, createUser);
router.route("/:id").get(checkAuth, getUserById).delete(checkAuth, removeUserById);

export default router;
