import { Router } from "express";
import { getAllGames, getGameById, createGame, removeGameById } from "../controllers/GamesController.js";

const router = Router();

router.route("/").get(getAllGames).post(createGame);
router.route("/:id").get(getGameById).delete(removeGameById);

export default router;
