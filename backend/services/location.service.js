import redis from "../config/redis.js";
import logger from "../utils/logger.js";

const CAPTAIN_GEO_KEY = "captains:geo";

/**
 * Update captain location in Redis (fast, ephemeral)
 */
export const updateCaptainLocationInRedis = async (captainId, lat, lng) => {
    if (redis.status !== "ready") return;
    try {
        await redis.geoadd(CAPTAIN_GEO_KEY, lng, lat, captainId);
        // Also set a simple key with TTL so they expire if they disconnect ungracefully
        await redis.set(`captain:${captainId}:active`, "true", "EX", 300); // 5 minutes TTL
    } catch (error) {
        logger.error({ error }, "Error updating location in Redis");
    }
};

/**
 * Remove captain from Redis
 */
export const removeCaptainFromRedis = async (captainId) => {
    if (redis.status !== "ready") return;
    try {
        await redis.zrem(CAPTAIN_GEO_KEY, captainId);
        await redis.del(`captain:${captainId}:active`);
    } catch (error) {
        logger.error({ error }, "Error removing captain from Redis");
    }
};

/**
 * Find captains in radius using Redis GEORADIUS
 * Returns array of captain IDs
 */
export const getCaptainsInRadiusRedis = async (lat, lng, radiusKm) => {
    if (redis.status !== "ready") return [];
    try {
        // GEORADIUS key longitude latitude radius m|km|ft|mi
        const captains = await redis.georadius(
            CAPTAIN_GEO_KEY,
            lng,
            lat,
            radiusKm,
            "km"
        );
        
        // Filter out captains whose TTL expired
        const activeCaptains = [];
        for (const capId of captains) {
            const isActive = await redis.get(`captain:${capId}:active`);
            if (isActive) {
                activeCaptains.push(capId);
            } else {
                // Cleanup stale data
                redis.zrem(CAPTAIN_GEO_KEY, capId).catch(() => {});
            }
        }
        
        return activeCaptains;
    } catch (error) {
        logger.error({ error }, "Error finding captains in Redis");
        return [];
    }
};
