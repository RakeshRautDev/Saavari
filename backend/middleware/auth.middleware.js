import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { BlacklistToken } from "../models/blacklistToken.model.js";


const authMiddleware = async (req, res, next) => {
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

export default authMiddleware;