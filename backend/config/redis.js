import Redis from "ioredis";
import logger from "../utils/logger.js";

const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
    retryStrategy(times) {
   
        const delay = Math.min(times * 1000, 5000);
        return delay;
    },
    maxRetriesPerRequest: null,
});

let hasLoggedError = false;

redis.on("error", (err) => {
    if (!hasLoggedError) {
        logger.error("Redis connection failed. Ensure Redis is running locally on port 6379.");
        hasLoggedError = true;
    }
});

redis.on("connect", () => {
    hasLoggedError = false;
    logger.info("Connected to Redis");
});

export default redis;
