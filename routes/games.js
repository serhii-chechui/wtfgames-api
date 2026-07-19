import { Router } from "express";
import { getAllGames, getGameById, createGame, updateGameById, removeGameById } from "../controllers/games.js";
import { upload } from "../middleware/upload.js";
import { checkAuth } from "../middleware/check-auth.js";

const router = Router();

// Чтение игр — публично (нужно публичному сайту). Изменения — только для
// аутентифицированных пользователей админ-панели.
router.route("/").get(getAllGames).post(checkAuth, upload.single("Thumbnail"), createGame);
router.route("/:id").get(getGameById).patch(checkAuth, updateGameById).delete(checkAuth, removeGameById);

export default router;
