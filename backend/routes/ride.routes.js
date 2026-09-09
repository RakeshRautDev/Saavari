import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.js";
import { body,query } from "express-validator";
import { createRideController } from "../controllers/ride.controller.js";
import { getFareController } from "../controllers/ride.controller.js";
const router=Router();

router.post("/create",
    body("pickup").isString().isLength({min:3}).withMessage("Invalid pickup address"),
    body("destination").isString().isLength({min:3}).withMessage("Invalid destination address"),
    body("vehicleType").isString().isIn(['auto',"car","motorcycle"]).withMessage("Invalid vehicle type"),authUser,createRideController
)


router.get(
    "/get-fare",
    query("pickup")
        .isString()
        .notEmpty()
        .withMessage("Pickup address is required"),

    query("destination")
        .isString()
        .notEmpty()
        .withMessage("Destination address is required"),

    authUser,

    getFareController
);


export default router;
