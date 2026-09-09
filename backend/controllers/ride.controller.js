import { compare } from 'bcrypt';
import { createRide  } from './../services/ride.service.js';
import { validationResult } from 'express-validator';
import { getFare } from "../services/ride.service.js";

export const createRideController=async(req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const {pickup,destination,vehicleType}=req.body;
    console.log(req.body.user);
    try {
        const ride=await createRide({user:req.user._id,pickup,destination,vehicleType});
        return res.status(201).json({ride,message:"Ride created Succesfully"})
        
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