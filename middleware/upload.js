// middlewares/upload.js
import multer from "multer";

// In-memory storage (buffer in req.file.buffer)
const storage = multer.memoryStorage();

// Async-friendly file filter
async function asyncFileFilter(req, file) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
        throw new Error("Only jpg, png, and webp files are allowed");
    }
    // Optional: you could add more async validation here, like checking virus scanning service, etc.
}

// Multer-compatible wrapper
function fileFilterWrapper(req, file, cb) {
    asyncFileFilter(req, file)
        .then(() => cb(null, true))
        .catch((err) => cb(err));
}

export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
    },
    fileFilter: fileFilterWrapper,
});
