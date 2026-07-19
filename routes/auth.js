import { Router } from "express";
import { login, logout, getMe } from "../controllers/auth.js";
import { checkAuth } from "../middleware/check-auth.js";
import { loginLimiter } from "../middleware/rate-limit.js";
import { validate } from "../middleware/validate.js";
import { loginSchema } from "../validation/schemas.js";

const router = Router();

router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", checkAuth, getMe);

export default router;
