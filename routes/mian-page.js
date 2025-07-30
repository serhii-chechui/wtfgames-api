import { Router } from "express";
import { getMainPageSettings, getSubTitle, setMainPage } from "../controllers/main-page";
import multer, { diskStorage } from "multer";

const storage = diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10485760,
    },
});

import { checkAuth } from "../middleware/check-auth";

const router = Router();

router.get("/", getMainPageSettings);
router.get("/subtitle", getSubTitle);
router.get("/subtitle", getSubTitle);

router.post("/", checkAuth, upload.single("headerImage"), setMainPage);

export default router;
