import { Router } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { captainModel } from "../models/captain.model.js";
import { authUser, authCaptain } from "../middleware/auth.middleware.js";
import { getCoordinates, getDistanceTimeController, getAutoCompleteSuggestionsController, getRoute, getAddressFromCoordinates } from "./../controllers/maps.controller.js";
import { query } from "express-validator";

const router = Router();

const authAny = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith("Bearer ")) {
            const extracted = req.headers.authorization.split(" ")[1];
            if (extracted !== "null" && extracted !== "undefined") {
                token = extracted;
            }
        }
        
        if (!token && req.cookies?.["captain-token"]) {
            token = req.cookies["captain-token"];
        }
        
        if (!token && req.cookies?.["user-token"]) {
            token = req.cookies["user-token"];
        }

        if (!token) {
            require('fs').appendFileSync('auth-error.log', 'authAny failed: missing token\n');
            return res.status(401).json({ message: "Unauthorized request" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Try user first
        const user = await User.findById(decoded._id);
        if (user) {
            req.user = user;
            return next();
        }

        // Try captain next
        const captain = await captainModel.findById(decoded._id);
        if (captain) {
            req.captain = captain;
            return next();
        }

        require('fs').appendFileSync('auth-error.log', 'authAny failed: neither user nor captain found for ID ' + decoded._id + '\n');
        return res.status(401).json({ message: "Unauthorized request" });
    } catch (error) {
        require('fs').appendFileSync('auth-error.log', 'authAny failed exception: ' + (error.stack || error) + '\n');
        return res.status(401).json({ message: "Invalid token" });
    }
};

router.get("/get-address",
    query("lat").isNumeric(),
    query("lng").isNumeric(),
    authAny,
    getAddressFromCoordinates
);

router.get("/get-coordinates",
    query("address").isString().isLength({ min: 3 }),
    authAny,
    getCoordinates
);

router.get("/get-distance-time",
    query("origin").isString().isLength({ min: 3 }),
    query("destination").isString().isLength({ min: 3 }),
    authAny,
    getDistanceTimeController
);

router.get("/get-suggestions",
    query("input").isString().isLength({ min: 3 }),
    authAny,
    getAutoCompleteSuggestionsController
);

router.get("/get-route",
    [
        query("pickup").notEmpty().withMessage("Pickup location is required"),
        query("destination").notEmpty().withMessage("Destination is required"),
        query("vehicleType").optional().isIn(["car", "bike", "auto"]).withMessage("Invalid vehicle type")
    ],
    authAny,
    getRoute
);

export default router;