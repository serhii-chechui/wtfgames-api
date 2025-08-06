import { Router } from "express";
import { getAllUsers, getUserById, createUser, removeUserById } from "../controllers/users.js";

const router = Router();

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUserById).delete(removeUserById);

export default router;
