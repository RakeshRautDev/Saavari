import { ExpressValidator,body } from 'express-validator';
import { Router } from 'express';
import { registerCaptain } from '../controllers/captain.controller.js';
const router=Router();


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
export default router;