import { getDistanceTime } from "./maps.service.js";

export const getFare = async (pickup, destination) => {
    if (!pickup || !destination) {
        throw new Error("Pickup and destination are required");
    }
    const distanceTime = await getDistanceTime(pickup, destination);
    return calculateFare(distanceTime.distance, distanceTime.duration);
};

export const calculateFare = (distanceMeters, durationSeconds) => {
    const distanceInKm = distanceMeters / 1000;
    const durationInMinutes = durationSeconds / 60;

    const baseFare = { auto: 30, car: 50, motorcycle: 20 };
    const perKmRate = { auto: 10, car: 15, motorcycle: 8 };
    const perMinuteRate = { auto: 2, car: 3, motorcycle: 1.5 };

    return {
        auto: Math.round(baseFare.auto + (perKmRate.auto * distanceInKm) + (perMinuteRate.auto * durationInMinutes)),
        car: Math.round(baseFare.car + (perKmRate.car * distanceInKm) + (perMinuteRate.car * durationInMinutes)),
        motorcycle: Math.round(baseFare.motorcycle + (perKmRate.motorcycle * distanceInKm) + (perMinuteRate.motorcycle * durationInMinutes))
    };
};
