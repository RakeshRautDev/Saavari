import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { BlacklistToken } from "../models/blacklistToken.model.js";
import { captainModel } from "../models/captain.model.js";


const authUser = async (req, res, next) => {
    try {
        console.log("Auth middleware called");
        console.log("Request:", req.method, req.originalUrl);

        let token;

        if (req.cookies?.token) {
            console.log("Token found in cookies");
            token = req.cookies.token;
        } else if (req.headers.authorization) {
            console.log("Authorization header found");

            token = req.headers.authorization.split(" ")[1];

            console.log("Token extracted from Authorization header");
        }

        if (!token) {
            console.log("No token found");

            return res.status(401).json({
                message: "Unauthorized request"
            });
        }

        const isBlackListed=await BlacklistToken.findOne({token})
        if(isBlackListed){
            return res.status(401).json({message:"Unauthorized Access"})
        }

        console.log("Verifying JWT...");

        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("JWT verified successfully");
        console.log("Decoded user ID:", decodedToken._id);

        const user = await User.findById(decodedToken._id);

        if (!user) {
            console.log("User not found:", decodedToken._id);

            return res.status(401).json({
                message: "Unauthorized request"
            });
        }

        console.log("User found:", user.email);

        req.user = user;

        console.log("User attached to req.user");

        console.log("Authentication successful");

        next();

    } catch (error) {
        console.log("Authentication error:", error.message);

        next(error);
    }
};

const authCaptain = async (req, res, next) => {
    try {
        console.log("Auth middleware called");
        console.log("Request:", req.method, req.originalUrl);

        let token;

        if (req.cookies?.token) {
            console.log("Token found in cookies");
            token = req.cookies.token;
        }

        else if (req.headers.authorization) {
            console.log("Authorization header found");

            const authHeader = req.headers.authorization;

            if (!authHeader.startsWith("Bearer ")) {
                return res.status(401).json({
                    message: "Invalid authorization format"
                });
            }

            token = authHeader.split(" ")[1];
            console.log("Token extracted from Authorization header");
        }

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized request"
            });
        }

        const isBlacklisted = await BlacklistToken.findOne({ token });

        if (isBlacklisted) {
            return res.status(401).json({
                message: "Unauthorized access"
            });
        }

        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("JWT verified");
        console.log("Captain ID:", decodedToken._id);

        const captain = await captainModel.findById(decodedToken._id);

        if (!captain) {
            return res.status(401).json({
                message: "Captain not found"
            });
        }

        req.captain = captain;

        console.log("Authentication successful");

        next();

    } catch (error) {
        console.log("Authentication error:", error.message);

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token expired"
            });
        }

        next(error);
    }
};

export default authCaptain;

export {authUser,authCaptain};