import { Router } from "express";
import {
    getAllApplications,
    getApplicationById,
    createApplication,
    updateApplicationById,
    removeApplicationById,
} from "../controllers/applications.js";
import { upload } from "../middleware/upload.js";
import { checkAuth } from "../middleware/check-auth.js";

const router = Router();

// Чтение — публично (нужно публичному сайту). Изменения — только для
// аутентифицированных пользователей админ-панели. checkAuth стоит ПЕРЕД
// upload.single, чтобы неавторизованный запрос не доходил до multer/S3.
router.route("/").get(getAllApplications).post(checkAuth, upload.single("Thumbnail"), createApplication);
router
    .route("/:id")
    .get(getApplicationById)
    .patch(checkAuth, updateApplicationById)
    .delete(checkAuth, removeApplicationById);

export default router;
