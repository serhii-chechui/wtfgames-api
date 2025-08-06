import sharp from "sharp";

export const resizeImage = async (width, height, inputBuffer) => {
    try {
        const resizedImage = await sharp(inputBuffer)
            .resize(width, height, { fit: "cover" })
            .toBuffer({ resolveWithObject: false });
        return resizedImage;
    } catch (err) {
        console.error(err.message);
    }
};
