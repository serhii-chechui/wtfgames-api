import { beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { logger } from "../config/logger.js";

// Test environment: a throwaway JWT secret, test mode, and a permissive CORS
// origin. NODE_ENV=test also disables the login rate limiter.
process.env.NODE_ENV = "test";
process.env.JWT_PRIVATE = process.env.JWT_PRIVATE || "test-jwt-secret";
process.env.CLIENT_ORIGINS = process.env.CLIENT_ORIGINS || "http://localhost:3000";

// Keep test output clean.
logger.silent = true;

let mongod;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
        await collections[key].deleteMany({});
    }
});

afterAll(async () => {
    await mongoose.connection.close();
    if (mongod) await mongod.stop();
});
