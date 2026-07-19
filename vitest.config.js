import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        globals: true,
        setupFiles: ["./tests/setup.js"],
        // Run test files sequentially: each file owns a single in-memory MongoDB
        // and the app uses one global mongoose connection.
        fileParallelism: false,
        hookTimeout: 60000, // first run may download the mongodb-memory-server binary
        testTimeout: 20000,
    },
});
