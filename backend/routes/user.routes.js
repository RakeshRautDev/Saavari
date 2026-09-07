import { Router } from 'express';
import { body } from 'express-validator';
import { registerUser,loginUser, getUserProfile, logoutUser } from '../controllers/user.controller.js';
import { authUser} from '../middleware/auth.middleware.js';

const router = Router();

router.post(
    '/register',

    (req, res, next) => {
        if (!req.body.fullname && (req.body.firstname || req.body.lastname)) {
            req.body.fullname = {
                firstname: req.body.firstname,
                lastname: req.body.lastname
            };
        }
        console.log("POST /users/register received");
        console.log("Request body:", req.body);
        next();
    },

    [
        body('email')
            .isEmail()
            .withMessage("Invalid Email"),

        body('fullname.firstname')
            .isLength({ min: 3 })
            .withMessage("Firstname should be at least 3 characters"),

        body('fullname.lastname')
            .isLength({ min: 3 })
            .withMessage("Lastname should be at least 3 characters"),

        body('password')
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long")
    ],

    registerUser
);


router.post("/login",
    [body('email')
    .isEmail()
    .withMessage("Invalid Email"), body('password')
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
    ],loginUser
)

router.get("/profile",authUser ,getUserProfile)
router.post("/logout",authUser,logoutUser)
export default router;