import sharp from "sharp";
import { logger } from "../config/logger.js";

export const resizeImage = async (width, height, inputBuffer) => {
    try {
        const resizedImage = await sharp(inputBuffer)
            .resize(width, height, { fit: "cover" })
            .toBuffer({ resolveWithObject: false });
        return resizedImage;
    } catch (err) {
        // Re-throw so the caller returns an error instead of silently uploading
        // an undefined buffer to S3 (previously the error was swallowed).
        logger.error(`Image resize failed: ${err.message}`);
        throw err;
    }
};
