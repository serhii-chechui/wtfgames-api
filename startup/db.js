import mongoose from "mongoose";

// Возвращает только host из строки подключения, без логина/пароля.
// Никогда не бросает: логирование не должно влиять на запуск.
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
