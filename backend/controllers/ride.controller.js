import { confirmRideService, createRide, startRideService, endRideService } from "./../services/ride.service.js";
import { validationResult } from "express-validator";
import { getFare } from "../services/fare.service.js";
import { getAddressCoordinate, getCaptainsInTheRadius } from "../services/maps.service.js";
import { sendMessageToSocketId } from "../socket.js";
import logger from "../utils/logger.js";
import { captainModel } from "../models/captain.model.js";

export const createRideController = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { pickup, destination, vehicleType } = req.body;

    try {
        const ride = await createRide({ user: req.user._id, pickup, destination, vehicleType });

        // Geocode pickup and find captains BEFORE responding so errors still reach next()
        const pickupCoordinates = await getAddressCoordinate(pickup);

        const { findCaptainsForRide } = await import("../services/matching.service.js");
        const captainsInRadius = await findCaptainsForRide(pickupCoordinates.lat, pickupCoordinates.lng);

        const rideData = ride.toObject();
        rideData.user = req.user.fullname;
        delete rideData.otp;

        captainsInRadius.forEach((captain) => {
            if (captain.socketId) {
                sendMessageToSocketId(captain.socketId, "new-ride", rideData);
            }
        });

        // Send response after all async work is done
        return res.status(201).json({ ride, message: "Ride created successfully" });
    } catch (error) {
        next(error);
    }
};



export const getFareController = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const { pickup, destination } = req.query;

        const fare = await getFare(pickup, destination);

        return res.status(200).json({
            message: "Fare calculated successfully",
            fare
        });

    } catch (error) {
        console.error("Get Fare Error:", error);

        return res.status(500).json({
            message: "Unable to calculate fare"
        });
    }
};

export const confirmRide = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await confirmRideService(rideId, req.captain._id);
        sendMessageToSocketId(ride.user.socketId, "ride-confirmed", ride);
       
        return res.status(200).json(ride);
    } catch (error) {
        next(error);
    }
};

export const startRide = async (req, res) => {
    try {
        const { rideId, otp } = req.query;

        const captain = req.captain;

        const ride = await startRideService({
            rideId,
            otp,
            captain
        });

        return res.status(200).json({
            success: true,
            message: "Ride started successfully",
            ride
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const endRide = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { rideid } = req.body;

        if (!rideid) {
            return res.status(400).json({
                success: false,
                message: "Ride ID is required"
            });
        }

        const ride = await endRideService({
            rideId: rideid,
            captain: req.captain
        });

        return res.status(200).json({
            success: true,
            message: "Ride ended successfully",
            ride
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getUserCurrentRide = async (req, res) => {
    try {
        const { rideModel } = await import('../models/ride.model.js');
        const ride = await rideModel.findOne({
            user: req.user._id,
            status: { $in: ['pending', 'accepted', 'ongoing'] }
        })
        .select('+otp')
        .populate('captain');
        
        return res.status(200).json(ride);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching current ride" });
    }
};

export const getCaptainCurrentRide = async (req, res) => {
    try {
        const { rideModel } = await import('../models/ride.model.js');
        const ride = await rideModel.findOne({
            captain: req.captain._id,
            status: { $in: ['accepted', 'ongoing'] }
        }).populate('user'); 
        
        return res.status(200).json(ride);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching current ride" });
    }
};

import { getUserRideHistory, getCaptainRideHistory, getCaptainAnalytics } from "../services/ride.service.js";

export const getUserHistoryController = async (req, res) => {
    try {
        const history = await getUserRideHistory(req.user._id);
        return res.status(200).json(history);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching user history", error: error.message });
    }
};

export const getCaptainHistoryController = async (req, res) => {
    try {
        const history = await getCaptainRideHistory(req.captain._id);
        return res.status(200).json(history);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching captain history", error: error.message });
    }
};

export const getCaptainAnalyticsController = async (req, res) => {
    try {
        const analytics = await getCaptainAnalytics(req.captain._id);
        return res.status(200).json(analytics);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching captain analytics", error: error.message });
    }
};

import { rateRideService } from "../services/ride.service.js";

export const rateRideController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { rideId, rating, userType } = req.body;
        
        // userType is passed securely from the auth middleware, 
        // so we derive it from whether req.user or req.captain exists
        const actualUserType = req.user ? 'user' : 'captain';

        const updatedRide = await rateRideService({ rideId, rating, userType: actualUserType });
        
        return res.status(200).json({ success: true, message: "Rated successfully", ride: updatedRide });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

import { cancelRideService } from "../services/ride.service.js";

export const cancelRideController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { rideId } = req.body;
        
        const actualUserType = req.user ? 'user' : 'captain';
        const userId = req.user ? req.user._id : req.captain._id;

        const updatedRide = await cancelRideService({ rideId, userType: actualUserType, userId });
        
        return res.status(200).json({ success: true, message: "Ride cancelled successfully", ride: updatedRide });
    } catch (error) {
        console.error("Cancel ride error:", error);
        return res.status(400).json({ success: false, message: error.message });
    }
};