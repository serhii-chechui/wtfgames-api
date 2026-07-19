import { Router } from "express";
import { getAllGames, getGameById, createGame, updateGameById, removeGameById } from "../controllers/games.js";
import { upload } from "../middleware/upload.js";
import { checkAuth } from "../middleware/check-auth.js";
import { validate } from "../middleware/validate.js";
import { createGameSchema, updateGameSchema } from "../validation/schemas.js";

const router = Router();

// Reading games is public (needed by the public site). Mutations are only for
// authenticated admin-panel users. validate runs after upload.single so the
// multipart body fields are populated before validation.
router
    .route("/")
    .get(getAllGames)
    .post(checkAuth, upload.single("Thumbnail"), validate(createGameSchema), createGame);
router
    .route("/:id")
    .get(getGameById)
    .patch(checkAuth, validate(updateGameSchema), updateGameById)
    .delete(checkAuth, removeGameById);

export default router;
