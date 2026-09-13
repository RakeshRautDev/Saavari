import { rideModel } from "../models/ride.model.js";
import { sendMessageToSocketId } from "../socket.js";
import { getDistanceTime } from "./maps.service.js";
import { randomInt } from "node:crypto";
import { getFare } from "./fare.service.js";

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

    const distanceTime = await getDistanceTime(pickup, destination);
    
    // We already have distanceTime for fare, let's also fetch coords
    const { getAddressCoordinate } = await import('./maps.service.js');
    const pickupCoords = await getAddressCoordinate(pickup);
    const destCoords = await getAddressCoordinate(destination);

    const ride = await rideModel.create({
        user,
        pickup,
        pickupCoords: { type: 'Point', coordinates: [pickupCoords.lng, pickupCoords.lat] },
        destination,
        destinationCoords: { type: 'Point', coordinates: [destCoords.lng, destCoords.lat] },
        fare: fare[vehicleType],
        distance: distanceTime.distance,
        duration: distanceTime.duration,
        otp: getOtp()
    });

    return ride;
};

export const getOtp = () => {
    return randomInt(1000, 10000).toString();
};


export const confirmRideService = async (rideId, captainId) => {
    if (!rideId) throw new Error("Ride id is required");
    if (!captainId) throw new Error("Captain id is required");

    // Atomic: only succeeds if ride is still pending — prevents race condition
    const ride = await rideModel.findOneAndUpdate(
        { _id: rideId, status: "pending" },
        { status: "accepted", captain: captainId },
        { new: true }
    )
        .select("+otp")
        .populate("user")
        .populate("captain");

    if (!ride) {
        throw new Error("Ride not found or already accepted");
    }

    return ride;
};

export const startRideService = async ({ rideId, otp, captain }) => {

    if (!rideId || !otp || !captain) {
        throw new Error("All fields are required");
    }

    const ride = await rideModel
        .findOne({
            _id: rideId,
            captain: captain._id
        })
        .populate("user")
        .populate("captain")
        .select("+otp");

    if (!ride) {
        throw new Error("Ride not found");
    }

    if (ride.status !== "accepted") {
        throw new Error("Ride not accepted");
    }

    if (String(ride.otp) !== String(otp)) {
        throw new Error("Invalid OTP");
    }

    ride.status = "ongoing";
    await ride.save();

    sendMessageToSocketId(
        ride.user.socketId,
        "ride-started",
        {rideId,ride}
        
    );

    return ride;
};


export const endRideService = async ({ rideId, captain }) => {
    if (!rideId || !captain) {
        throw new Error("All fields are required");
    }

    const ride = await rideModel.findOne({
        _id: rideId,
        captain: captain._id
    })
    .populate("user")
    .populate("captain");

    if (!ride) {
        throw new Error("Ride not found");
    }

    if (ride.status !== "ongoing") {
        throw new Error("Ride is not ongoing");
    }

    ride.status = "completed";

    await ride.save();

    sendMessageToSocketId(
        ride.user.socketId,
        "ride-ended",
        ride
    );

    return ride;
};

export const getUserRideHistory = async (userId) => {
    if (!userId) throw new Error("User id is required");
    const history = await rideModel.find({ user: userId })
        .populate("captain")
        .sort({ createdAt: -1 });
    return history;
};

export const getCaptainRideHistory = async (captainId) => {
    if (!captainId) throw new Error("Captain id is required");
    const history = await rideModel.find({ captain: captainId })
        .populate("user")
        .sort({ createdAt: -1 });
    return history;
};

export const getCaptainAnalytics = async (captainId) => {
    if (!captainId) throw new Error("Captain id is required");

    const mongoose = await import("mongoose");
    const objectId = new mongoose.default.Types.ObjectId(captainId);

    const stats = await rideModel.aggregate([
        { $match: { captain: objectId, status: "completed" } },
        {
            $group: {
                _id: null,
                totalRides: { $sum: 1 },
                totalEarnings: { $sum: "$fare" }
            }
        }
    ]);

    const totalRides = stats.length > 0 ? stats[0].totalRides : 0;
    const totalEarnings = stats.length > 0 ? stats[0].totalEarnings : 0;

    return { totalRides, totalEarnings };
};

export const rateRideService = async ({ rideId, rating, userType }) => {
    if (!rideId || !rating || !userType) {
        throw new Error("Ride ID, rating, and userType are required");
    }

    const ride = await rideModel.findById(rideId);
    if (!ride) {
        throw new Error("Ride not found");
    }

    if (ride.status !== "completed") {
        throw new Error("Can only rate completed rides");
    }

    let targetModel;
    let targetId;

    if (userType === 'user') {
        // User is rating the captain
        if (ride.captainRating) throw new Error("Already rated");
        ride.captainRating = rating;
        targetId = ride.captain;
        
        // Dynamic import to avoid circular dependency issues if any
        const { captainModel } = await import('../models/captain.model.js');
        targetModel = captainModel;
    } else if (userType === 'captain') {
        // Captain is rating the user
        if (ride.userRating) throw new Error("Already rated");
        ride.userRating = rating;
        targetId = ride.user;
        
        const { User } = await import('../models/user.model.js');
        targetModel = User;
    } else {
        throw new Error("Invalid userType");
    }

    await ride.save();

    // Recalculate average rating for the target
    const target = await targetModel.findById(targetId);
    if (target) {
        const currentTotal = target.totalRatings || 0;
        const currentAvg = target.averageRating || 5.0;
        
        const newTotal = currentTotal + 1;
        const newAvg = ((currentAvg * currentTotal) + rating) / newTotal;
        
        target.totalRatings = newTotal;
        target.averageRating = Math.round(newAvg * 10) / 10; // Round to 1 decimal
        await target.save();
    }

    return ride;
};

export const cancelRideService = async ({ rideId, userType, userId }) => {
    if (!rideId || !userType || !userId) {
        throw new Error("Ride ID, userType, and userId are required");
    }

    const ride = await rideModel.findById(rideId).populate("user").populate("captain");
    if (!ride) {
        throw new Error("Ride not found");
    }

    if (ride.status === "completed" || ride.status === "cancelled") {
        throw new Error(`Cannot cancel a ride that is already ${ride.status}`);
    }

    if (userType === 'user' && ride.user._id.toString() !== userId.toString()) {
        throw new Error("Unauthorized to cancel this ride");
    }
    
    if (userType === 'captain' && ride.captain && ride.captain._id.toString() !== userId.toString()) {
        throw new Error("Unauthorized to cancel this ride");
    }

    ride.status = "cancelled";
    await ride.save();

    // Broadcast cancellation to the other party
    if (userType === 'user') {
        if (ride.captain && ride.captain.socketId) {
            sendMessageToSocketId(ride.captain.socketId, "ride-cancelled", ride);
        }
    } else if (userType === 'captain') {
        if (ride.user && ride.user.socketId) {
            sendMessageToSocketId(ride.user.socketId, "ride-cancelled", ride);
        }
    }

    return ride;
};