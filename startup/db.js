import mongoose from "mongoose";
import { logger } from "../config/logger.js";

// Returns only the host from the connection string, without credentials.
// Never throws: logging must not affect startup.
const safeMongoHost = (uri) => {
    try {
        return new URL(uri).host;
    } catch {
        return "unknown";
    }
};

const connectDB = async () => {
    try {
        const connectionURL = process.env.MONGO_URI;
        logger.info(`Mongo connecting to host: ${safeMongoHost(connectionURL)}`);
        const conn = await mongoose.connect(connectionURL);
        logger.info(`Mongo connected to: ${conn.connection.name}`);
    } catch (error) {
        logger.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
