// Fail fast on startup if a required environment variable is missing, instead
// of crashing later on the first request that needs it (e.g. JWT signing).
const REQUIRED_ENV = ["MONGO_URI", "JWT_PRIVATE"];

export default function validateEnv() {
    const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        console.error(`Missing required environment variables: ${missing.join(", ")}`);
        process.exit(1);
    }
}
