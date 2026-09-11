import { Router } from 'express';
import { authUser } from '../middleware/auth.middleware.js';
import { getAddressCoordinate } from '../services/maps.service.js';
import { getCoordinates,getDistanceTimeController, getAutoCompleteSuggestionsController, getRoute} from './../controllers/maps.controller.js';
import { query } from 'express-validator';

const router=Router();

router.get("/get-coordinates",
    query("address").isString().isLength({min:3}),
    authUser,getCoordinates )
router.get("/get-distance-time",
    query("origin").isString().isLength({min:3}),
    query("destination").isString().isLength({min:3}),
    authUser,
getDistanceTimeController

)


router.get("/get-suggestions",
    query("input").isString().isLength({min:3}),
    authUser,
    getAutoCompleteSuggestionsController
)


router.get(
    "/get-route",
    [
        query("pickup")
            .trim()
            .notEmpty()
            .withMessage("Pickup location is required"),

        query("destination")
            .trim()
            .notEmpty()
            .withMessage("Destination is required"),

        query("vehicleType")
            .optional()
            .isIn(["car", "bike", "auto"])
            .withMessage("Invalid vehicle type")
    ],
    getRoute
);
export default router; 