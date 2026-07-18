import { Router } from "express";
import { login, logout, getMe } from "../controllers/auth.js";
import { checkAuth } from "../middleware/check-auth.js";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", checkAuth, getMe);

export default router;
