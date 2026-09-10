import { Router } from "express";
import authCaptain, { authUser } from "../middleware/auth.middleware.js";
import { body,query } from "express-validator";
import { createRideController, confirmRide, getFareController,startRide ,endRide } from "../controllers/ride.controller.js";
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

router.post("/confirm",body("rideId").isMongoId().withMessage("Invalid RideId"),authCaptain,confirmRide);


router.get(
  "/start-ride",
  query("rideId")
    .isMongoId()
    .withMessage("Invalid ride ID"),
  query("otp")
    .isLength({ min: 4, max: 4 })
    .isNumeric()
    .withMessage("OTP must be a 4-digit number"),
  authCaptain,
  startRide
);
export default router;

router.post("/end-ride",body("rideId").isMongoId().withMessage("Invalid Ride Id"),authCaptain,endRide)