import { ExpressValidator, body } from 'express-validator';
import { Router } from 'express';
import { registerCaptain, loginCaptain ,getCaptainProfile ,logoutCaptain} from '../controllers/captain.controller.js';
import {authCaptain} from '../middleware/auth.middleware.js';
const router = Router();


router.post(
    "/register",
    [
        body("fullname.firstname")
            .trim()
            .isLength({ min: 3 })
            .withMessage("First name must be at least 3 characters long"),

        body("fullname.lastname")
            .trim()
            .isLength({ min: 3 })
            .withMessage("Last name must be at least 3 characters long"),

        body("email")
            .trim()
            .isEmail()
            .withMessage("Invalid email address"),

        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long"),

        body("vehicle.color")
            .trim()
            .isLength({ min: 3 })
            .withMessage("Vehicle color must be at least 3 characters long"),

        body("vehicle.plate")
            .trim()
            .isLength({ min: 3 })
            .withMessage("Vehicle plate must be at least 3 characters long"),

        body("vehicle.capacity")
            .isInt({ min: 1 })
            .withMessage("Vehicle capacity must be at least 1"),

        body("vehicle.vehicleType")
            .isIn(["car", "motorcycle", "auto"])
            .withMessage("Vehicle type must be car, motorcycle, or auto")
    ],
    registerCaptain
);

router.post("/login",
    [body("email").trim()
            .isEmail()
            .withMessage("Invalid email address"),
     body("password").isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long")], loginCaptain)
router.get("/profile",authCaptain ,getCaptainProfile)
router.post("/logout",authCaptain,logoutCaptain)

import { toggleStatusController } from '../controllers/captain.controller.js';

router.post("/status",
    authCaptain,
    [
        body("status").isIn(["active", "inactive"]).withMessage("Invalid status")
    ],
    toggleStatusController
)

export default router;