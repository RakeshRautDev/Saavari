import { compare } from 'bcrypt';
import { confirmRideService, createRide  } from './../services/ride.service.js';
import { validationResult } from 'express-validator';
import { getFare,startRideService, endRideService } from "../services/ride.service.js";
import { getAddressCoordinate, getCaptainsInTheRadius} from '../services/maps.service.js';
import { sendMessageToSocketId } from '../socket.js';
export const createRideController=async(req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const {pickup,destination,vehicleType}=req.body;
    
    try {
        const ride=await createRide({user:req.user._id,pickup,destination,vehicleType});
        res.status(201).json({ride,message:"Ride created Succesfully"})

  
        

        const pickupCoordinates=await getAddressCoordinate(pickup);
        console.log("Pickup Coordinates", pickupCoordinates);

        let CaptainRadius = await getCaptainsInTheRadius(pickupCoordinates.lat, pickupCoordinates.lng, 200);
        console.log(`Captains found within radius: ${CaptainRadius.length}`);

        if (CaptainRadius.length === 0) {
            console.log("No captains with location found — falling back to all captains with a socketId");
            const { captainModel } = await import('../models/captain.model.js');
            CaptainRadius = await captainModel.find({ socketId: { $exists: true, $ne: null } });
            console.log(`Fallback: found ${CaptainRadius.length} captains with socketId`);
        }

        const rideData = ride.toObject();
        console.log(req.user);
        rideData.user=req.user.fullname;
        delete rideData.otp;

        console.log("Sending new-ride to captains:", CaptainRadius.map(c => ({ id: c._id, socketId: c.socketId })));
        CaptainRadius.forEach((captain) => {
            if (captain.socketId) {
                console.log(`  → Emitting to socketId: ${captain.socketId}`);
                sendMessageToSocketId(captain.socketId, "new-ride", rideData);
            } else {
                console.log(`  ✗ Captain ${captain._id} has no socketId — skipping`);
            }
        });
    } catch (error) {
    next(error);
    }
}



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

export const confirmRide=async(req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty){
        res.status(400).json({errors:errors.array()})
    }

    const {rideId}=req.body;

    try {
        const ride=await confirmRideService(rideId,req.captain._id);
        sendMessageToSocketId(ride.user.socketId,"ride-confirmed",ride);
       
        return res.status(200).json(ride);
    } catch (error) {
        next(error)
    }
}
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