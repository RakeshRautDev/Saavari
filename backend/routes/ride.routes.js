import { Router } from "express";
import authCaptain, { authUser } from "../middleware/auth.middleware.js";
import { body,query } from "express-validator";
import { 
  createRideController, confirmRide, getFareController, startRide, endRide, 
  getUserCurrentRide, getCaptainCurrentRide,
  getUserHistoryController, getCaptainHistoryController, getCaptainAnalyticsController 
} from "../controllers/ride.controller.js";
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
router.post(
  "/end-ride",
  body("rideid").isMongoId().withMessage("Invalid Ride Id"),
  authCaptain,
  endRide
);

router.get("/user-current-ride", authUser, getUserCurrentRide);
router.get("/captain-current-ride", authCaptain, getCaptainCurrentRide);

router.get("/user-history", authUser, getUserHistoryController);
router.get("/captain-history", authCaptain, getCaptainHistoryController);
router.get("/captain-analytics", authCaptain, getCaptainAnalyticsController);

import { rateRideController } from "../controllers/ride.controller.js";

router.post("/rate-captain", 
  authUser, 
  body("rideId").isMongoId().withMessage("Invalid Ride Id"),
  body("rating").isNumeric().isInt({min:1, max:5}).withMessage("Rating must be 1-5"),
  rateRideController
);

router.post("/rate-user", 
  authCaptain, 
  body("rideId").isMongoId().withMessage("Invalid Ride Id"),
  body("rating").isNumeric().isInt({min:1, max:5}).withMessage("Rating must be 1-5"),
  rateRideController
);

import { cancelRideController } from "../controllers/ride.controller.js";

router.post("/cancel-user", 
  authUser, 
  body("rideId").isMongoId().withMessage("Invalid Ride Id"),
  cancelRideController
);

router.post("/cancel-captain", 
  authCaptain, 
  body("rideId").isMongoId().withMessage("Invalid Ride Id"),
  cancelRideController
);

export default router;