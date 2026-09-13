import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

export default {
    PORT: process.env.PORT || 3000,
    DB_CONNECT: process.env.DATABASE_URL || process.env.DB_CONNECT,
    JWT_SECRET: process.env.JWT_SECRET,
    GEOAPIFY_API_KEY: process.env.GEOAPIFY_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
    NODE_ENV: process.env.NODE_ENV || "development"
};
