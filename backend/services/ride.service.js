import { rideModel } from "../models/ride.model.js";
import { getDistanceTime } from "./maps.service.js";
import { randomInt } from "node:crypto";
export const createRide = async ({
    user,
    pickup,
    destination,
    vehicleType
}) => {

    if (!user || !pickup || !destination || !vehicleType) {
        throw new Error("All fields are required");
    }

    const fare = await getFare(pickup, destination);

    if (!fare[vehicleType]) {
        throw new Error("Invalid vehicle type");
    }

    const ride = await rideModel.create({
        user,
        pickup,
        destination,
        fare: fare[vehicleType],
        otp:getOtp()
    });

    return ride;
};

export async function getFare(pickup, destination) {
    if (!pickup || !destination) {
        throw new Error("Pickup and destination are required");
    }

    const distanceTime = await getDistanceTime(pickup, destination);

    const distanceInKm = distanceTime.distance / 1000;
    const durationInMinutes = distanceTime.duration / 60;

    const baseFare = {
        auto: 30,
        car: 50,
        motorcycle: 20
    };

    const perKmRate = {
        auto: 10,
        car: 15,
        motorcycle: 8
    };

    const perMinuteRate = {
        auto: 2,
        car: 3,
        motorcycle: 1.5
    };

    const fare = {
        auto: Math.round(
            baseFare.auto +
            (perKmRate.auto * distanceInKm) +
            (perMinuteRate.auto * durationInMinutes)
        ),

        car: Math.round(
            baseFare.car +
            (perKmRate.car * distanceInKm) +
            (perMinuteRate.car * durationInMinutes)
        ),

        motorcycle: Math.round(
            baseFare.motorcycle +
            (perKmRate.motorcycle * distanceInKm) +
            (perMinuteRate.motorcycle * durationInMinutes)
        )
    };

    return fare;
}

export const getOtp = () => {
    return randomInt(1000, 10000).toString();
    crypto.random
};