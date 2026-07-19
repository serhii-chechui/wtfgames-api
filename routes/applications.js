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

// Reading is public (needed by the public site). Mutations are only for
// authenticated admin-panel users. checkAuth runs BEFORE upload.single so an
// unauthenticated request never reaches multer/S3.
router.route("/").get(getAllApplications).post(checkAuth, upload.single("Thumbnail"), createApplication);
router
    .route("/:id")
    .get(getApplicationById)
    .patch(checkAuth, updateApplicationById)
    .delete(checkAuth, removeApplicationById);

export default router;
