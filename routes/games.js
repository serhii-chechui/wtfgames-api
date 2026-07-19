import { Router } from "express";
import { getAllGames, getGameById, createGame, updateGameById, removeGameById } from "../controllers/games.js";
import { upload } from "../middleware/upload.js";
import { checkAuth } from "../middleware/check-auth.js";

const router = Router();

// Reading games is public (needed by the public site). Mutations are only for
// authenticated admin-panel users.
router.route("/").get(getAllGames).post(checkAuth, upload.single("Thumbnail"), createGame);
router.route("/:id").get(getGameById).patch(checkAuth, updateGameById).delete(checkAuth, removeGameById);

export default router;
