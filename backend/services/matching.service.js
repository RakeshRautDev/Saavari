import { getCaptainsInTheRadius } from "./maps.service.js";
import { captainModel } from "../models/captain.model.js";
import logger from "../utils/logger.js";

export const findCaptainsForRide = async (pickupLat, pickupLng) => {
    let captainsInRadius = await getCaptainsInTheRadius(pickupLat, pickupLng, 5);
    logger.info({ count: captainsInRadius.length }, "Captains found in 5km radius");

    if (captainsInRadius.length === 0) {
        logger.info("No captains in 5km — falling back to 25km");
        captainsInRadius = await getCaptainsInTheRadius(pickupLat, pickupLng, 25);
    }

    if (captainsInRadius.length === 0) {
        logger.info("No captains in radius — falling back to all active captains with socketId");
        captainsInRadius = await captainModel.find({
            status: "active",
            socketId: { $exists: true, $ne: null }
        });
    }

    return captainsInRadius;
};
