import { Router } from "express";
import { getAllGames, getGameById, createGame, updateGameById, removeGameById } from "../controllers/games.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.route("/").get(getAllGames).post(upload.single("Thumbnail"), createGame);
router.route("/:id").get(getGameById).patch(updateGameById).delete(removeGameById);

export default router;
