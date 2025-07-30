import { Router } from "express";
import { getAllUsers, getUserById, createUser, removeUserById, login } from "../controllers/users.js";

const router = Router();

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUserById).delete(removeUserById);
router.post("/login", login);

export default router;
