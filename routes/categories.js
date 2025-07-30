import express from "express";
import {
    getAllCategories,
    getCategoriesList,
    getCategoryById,
    createCategory,
    removeCategoryById,
} from "../controllers/categories.js";
import { checkAuth } from "../middleware/check-auth.js";

const router = express.Router();

router.route("/list").get(getCategoriesList);
router.route("/").get(getAllCategories).post(checkAuth, createCategory);
router.route("/:id").get(getCategoryById).delete(checkAuth, removeCategoryById);

export default router;
