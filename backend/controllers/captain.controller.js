import { validationResult } from "express-validator";
import { createCaptain } from "../services/captain.service.js";
import { captainModel } from "../models/captain.model.js";
import { BlacklistToken } from "../models/blacklistToken.model.js";

export const registerCaptain = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            fullname,
            email,
            password,
            vehicle
        } = req.body;

        const existingCaptain = await captainModel.findOne({ email });

        if (existingCaptain) {
            return res.status(409).json({
                message: "Email is already in use"
            });
        }

        const captain = await createCaptain({
            firstname: fullname.firstname,
            lastname: fullname.lastname,
            email,
            password,
            color: vehicle.color,
            plate: vehicle.plate,
            capacity: vehicle.capacity,
            vehicleType: vehicle.vehicleType
        });

        const token = captain.generateAuthToken();
        res.cookie("captain-token",token)
        return res.status(201).json({
            message: "Captain registered successfully",
            captain: {
                _id: captain._id,
                fullname: captain.fullname,
                email: captain.email,
                vehicle: captain.vehicle,
                status: captain.status
            },
            token
        });

    } catch (error) {
        next(error);
    }
};

export const loginCaptain=async(req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    const {email,password}=req.body;
    const captain=await captainModel.findOne({email}).select("+password");
    if(!captain){
        return res.status(401).json({message:"Unauthorized request"});
    }
    const isPasswordCorrect=await captain.comparePassword(password);
    if(!isPasswordCorrect){
        return res.status(401).json({message:" Invalid email or password"});
    }

    const token=captain.generateAuthToken();
    res.cookie("captain-token",token)
    const captainObject=captain.toObject();
    delete captainObject.password;
    res.status(200).json({message:"Captain LoggedIn Successfully",captain:captainObject})
}

export const getCaptainProfile=async(req,res,next)=>{
    res.status(200).json({captain:req.captain})
}

export const logoutCaptain = async (req, res, next) => {
    try {
        let token;

        if (req.cookies?.['captain-token']) {
            token = req.cookies['captain-token'];
        } else if (req.headers.authorization) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized request"
            });
        }

        await BlacklistToken.create({ token });

        res.clearCookie("captain-token");

        return res.status(200).json({
            message: "Captain logged out successfully"
        });

    } catch (error) {
        next(error);
    }
};