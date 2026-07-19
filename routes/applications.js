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
import { validate } from "../middleware/validate.js";
import { createApplicationSchema, updateApplicationSchema } from "../validation/schemas.js";

const router = Router();

// Reading is public (needed by the public site). Mutations are only for
// authenticated admin-panel users. checkAuth runs BEFORE upload.single so an
// unauthenticated request never reaches multer/S3; validate runs after
// upload.single so the multipart body fields are populated before validation.
router
    .route("/")
    .get(getAllApplications)
    .post(checkAuth, upload.single("Thumbnail"), validate(createApplicationSchema), createApplication);
router
    .route("/:id")
    .get(getApplicationById)
    .patch(checkAuth, validate(updateApplicationSchema), updateApplicationById)
    .delete(checkAuth, removeApplicationById);

export default router;
