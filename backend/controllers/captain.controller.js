import { validationResult } from "express-validator";
import { createCaptain } from "../services/captain.service.js";
import { captainModel } from "../models/captain.model.js";

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