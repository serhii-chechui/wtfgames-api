import mongoose from "mongoose";

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
        console.log(`Mongo connecting to host: ${safeMongoHost(connectionURL)}`);
        const conn = await mongoose.connect(connectionURL);
        console.log(`Mongo connected to: ${conn.connection.name}`);
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
};

export default connectDB;
