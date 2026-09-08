import { validationResult } from "express-validator";
import { createUser } from "../services/user.service.js";
import { User } from "../models/user.model.js";
import { BlacklistToken } from "../models/blacklistToken.model.js";

export const registerUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const firstname = req.body.fullname?.firstname || req.body.firstname;
        const lastname = req.body.fullname?.lastname || req.body.lastname;
        const { email, password } = req.body;

        const isUserAlreadyExist = await User.findOne({ email });
        if (isUserAlreadyExist) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const user = await createUser({
            firstname,
            lastname,
            email,
            password
        });

        const token = user.generateAuthToken();

        res.cookie("user-token", token);

        return res.status(201).json({
            token,
            user
        });

    } catch (error) {
        next(error);
    }
};

export const loginUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Invalid Email or Password"
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid Email or Password"
            });
        }

        const token = user.generateAuthToken();

        const userObject = user.toObject();
        delete userObject.password;

        return res.status(200).cookie("user-token",token).json({
            token,
            user: userObject
        });

    } catch (error) {
        next(error);
    }
};

export const getUserProfile= async(req,res,next)=>{
    return res.status(200).json({user:req.user});
}



export const logoutUser = async (req, res, next) => {
    try {
        let token;

        if (req.cookies?.['user-token']) {
            token = req.cookies['user-token'];
        } else if (req.headers.authorization) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (token) {
            await BlacklistToken.create({
                token: token
            });
        }

        res.clearCookie("user-token");

        return res.status(200).json({
            message: "Logout Successfully"
        });

    } catch (error) {
        next(error);
    }
};