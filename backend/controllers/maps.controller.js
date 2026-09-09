import {
    getAddressCoordinate,
    getDistanceTime,
    getAutoCompleteSuggestions
} from "../services/maps.service.js";
import { validationResult } from "express-validator";
export const getCoordinates = async (req, res) => {
    const error=validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json({error:error.array()})
    }

    try {
        const { address } = req.query;

        if (!address) {
            return res.status(400).json({
                message: "Address is required"
            });
        }

        const coordinates = await getAddressCoordinate(address);

        return res.status(200).json({
            message: "Coordinates fetched successfully",
            coordinates
        });

    } catch (error) {
        console.error("Error fetching coordinates:", error);

        return res.status(500).json({
            message: "Unable to fetch coordinates"
        });
    }
};




export const getDistanceTimeController = async (req, res) => {
    try {
        const { origin, destination } = req.query;

        if (!origin || !destination) {
            return res.status(400).json({
                message: "Origin and destination are required"
            });
        }

        const originCoordinates = await getAddressCoordinate(origin);
        const destinationCoordinates = await getAddressCoordinate(destination);

        const result = await getDistanceTime(
            originCoordinates,
            destinationCoordinates
        );

        return res.status(200).json({
            message: "Distance and time calculated successfully",
            result
        });

    } catch (error) {
        console.error("Error:", error);

        return res.status(500).json({
            message: "Unable to calculate distance and time"
        });
    }
};


export const getAutoCompleteSuggestionsController = async (req, res) => {
    try {
        const { input } = req.query;

        if (!input) {
            return res.status(400).json({
                message: "Input is required"
            });
        }

        const suggestions = await getAutoCompleteSuggestions(input);

        return res.status(200).json({
            message: "Suggestions fetched successfully",
            suggestions
        });

    } catch (error) {
        console.error("Autocomplete error:", error);

        return res.status(500).json({
            message: "Unable to fetch suggestions"
        });
    }
};