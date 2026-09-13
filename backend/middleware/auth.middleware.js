import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { BlacklistToken } from "../models/blacklistToken.model.js";
import { captainModel } from "../models/captain.model.js";
import logger from "../utils/logger.js";

const extractToken = (req, cookieName) => {
    const auth = req.headers.authorization;
    if (auth?.startsWith("Bearer ")) {
        const token = auth.split(" ")[1];
        if (token && token !== "null" && token !== "undefined") return token;
    }
    if (req.cookies?.[cookieName]) return req.cookies[cookieName];
    return null;
};

const authUser = async (req, res, next) => {
    try {
        const token = extractToken(req, "user-token");
        if (!token) return res.status(401).json({ message: "Unauthorized request" });

        const isBlacklisted = await BlacklistToken.findOne({ token });
        if (isBlacklisted) return res.status(401).json({ message: "Unauthorized access" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        if (!user) return res.status(401).json({ message: "Unauthorized request" });

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") return res.status(401).json({ message: "Invalid token" });
        if (error.name === "TokenExpiredError") return res.status(401).json({ message: "Token expired" });
        logger.error({ error }, "authUser error");
        next(error);
    }
};

const authCaptain = async (req, res, next) => {
    try {
        const token = extractToken(req, "captain-token");
        if (!token) return res.status(401).json({ message: "Unauthorized request" });

        const isBlacklisted = await BlacklistToken.findOne({ token });
        if (isBlacklisted) return res.status(401).json({ message: "Unauthorized access" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const captain = await captainModel.findById(decoded._id);
        if (!captain) return res.status(401).json({ message: "Captain not found" });

        req.captain = captain;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") return res.status(401).json({ message: "Invalid token" });
        if (error.name === "TokenExpiredError") return res.status(401).json({ message: "Token expired" });
        logger.error({ error }, "authCaptain error");
        next(error);
    }
};

export default authCaptain;
export { authUser, authCaptain };
