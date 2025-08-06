import mongoose from "mongoose";

const connectDB = async () => {
    try {
        console.log(`Mongo URL: ${process.env.MONGO_URI}`);
        const connectionURL = process.env.MONGO_URI;
        const conn = await mongoose.connect(connectionURL);
        console.log(`Mongo connected to: ${conn.connection.name}`);
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
};

export default connectDB;
