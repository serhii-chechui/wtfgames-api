import { Router } from "express";
import { getAllUsers, getUserById, createUser, removeUserById } from "../controllers/users.js";
import { checkAuth } from "../middleware/check-auth.js";
import { requireRole } from "../middleware/require-role.js";
import { validate } from "../middleware/validate.js";
import { createUserSchema } from "../validation/schemas.js";

const router = Router();

// User management is available only to authenticated admin-panel users. The
// first user is created via a seed script. Viewing — owner and admin;
// creating/deleting accounts — owner only.
router
    .route("/")
    .get(checkAuth, requireRole("owner", "admin"), getAllUsers)
    .post(checkAuth, requireRole("owner"), validate(createUserSchema), createUser);
router
    .route("/:id")
    .get(checkAuth, requireRole("owner", "admin"), getUserById)
    .delete(checkAuth, requireRole("owner"), removeUserById);

export default router;
