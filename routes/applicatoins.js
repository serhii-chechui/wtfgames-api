import { Router } from "express";
import {
    getAllApplications,
    getApplicationById,
    createApplication,
    updateApplicationById,
    removeApplicationById,
} from "../controllers/applications.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.route("/").get(getAllApplications).post(upload.single("Thumbnail"), createApplication);
router.route("/:id").get(getApplicationById).patch(updateApplicationById).delete(removeApplicationById);

export default router;
