import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { BlacklistToken } from "../models/blacklistToken.model.js";
import { captainModel } from "../models/captain.model.js";


// =========================
// USER AUTHENTICATION
// =========================
const authUser = async (req, res, next) => {
    try {
        console.log("\n========== AUTH USER START ==========");

        console.log("➡️ Method:", req.method);
        console.log("➡️ URL:", req.originalUrl);

        console.log("🍪 Cookies:", req.cookies);
        console.log("🔑 Authorization Header:", req.headers.authorization);

        let token;

        // -------------------------
        // Get token from cookies
        // -------------------------
        if (req.cookies?.['user-token']) {
            console.log("✅ Token found in cookies");

            token = req.cookies['user-token'];

            console.log("🍪 Cookie token exists:", !!token);
            console.log("🍪 Token length:", token.length);
        }

        // -------------------------
        // Get token from Authorization header
        // -------------------------
        else if (req.headers.authorization) {
            console.log("✅ Authorization header found");

            const authHeader = req.headers.authorization;

            console.log("🔑 Auth header:", authHeader);

            if (!authHeader.startsWith("Bearer ")) {
                console.log("❌ Invalid Authorization format");

                return res.status(401).json({
                    message: "Invalid authorization format"
                });
            }

            token = authHeader.split(" ")[1];

            console.log("✅ Token extracted from Authorization header");
            console.log("🔑 Token exists:", !!token);
            console.log("🔑 Token length:", token?.length);
        }

        // -------------------------
        // No token
        // -------------------------
        if (!token) {
            console.log("❌ NO TOKEN FOUND");
            console.log("========== AUTH USER END ==========\n");

            return res.status(401).json({
                message: "Unauthorized request"
            });
        }

        console.log("🔐 Token received");
        console.log("🔐 Token preview:", token.substring(0, 20) + "...");

        // -------------------------
        // Check blacklist
        // -------------------------
        console.log("🔍 Checking token blacklist...");

        const isBlackListed = await BlacklistToken.findOne({ token });

        console.log(
            "🚫 Blacklist result:",
            isBlackListed ? "TOKEN IS BLACKLISTED" : "Token is not blacklisted"
        );

        if (isBlackListed) {
            console.log("❌ Authentication failed: Blacklisted token");

            return res.status(401).json({
                message: "Unauthorized Access"
            });
        }

        // -------------------------
        // Verify JWT
        // -------------------------
        console.log("🔐 Verifying JWT...");

        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("✅ JWT verified successfully");
        console.log("📦 Decoded token:", decodedToken);
        console.log("👤 User ID from JWT:", decodedToken._id);

        // -------------------------
        // Find user
        // -------------------------
        console.log("🔍 Searching user in database...");

        const user = await User.findById(decodedToken._id);

        if (!user) {
            console.log("❌ User NOT found");
            console.log("❌ Requested user ID:", decodedToken._id);

            return res.status(401).json({
                message: "Unauthorized request"
            });
        }

        console.log("✅ User found");
        console.log("👤 User ID:", user._id);
        console.log("📧 User email:", user.email);

        // -------------------------
        // Attach user to request
        // -------------------------
        req.user = user;

        console.log("✅ req.user attached");
        console.log("👤 req.user._id:", req.user._id);

        console.log("🎉 USER AUTHENTICATION SUCCESSFUL");
        console.log("========== AUTH USER END ==========\n");

        next();

    } catch (error) {

        console.log("\n❌❌❌ AUTH USER ERROR ❌❌❌");
        console.log("Error name:", error.name);
        console.log("Error message:", error.message);
        console.log("Error stack:", error.stack);
        console.log("====================================\n");

        next(error);
    }
};


// =========================
// CAPTAIN AUTHENTICATION
// =========================
const authCaptain = async (req, res, next) => {
    try {
        console.log("\n========== AUTH CAPTAIN START ==========");

        console.log("➡️ Method:", req.method);
        console.log("➡️ URL:", req.originalUrl);

        console.log("🍪 Cookies:", req.cookies);
        console.log("🔑 Authorization Header:", req.headers.authorization);

        let token;

        // -------------------------
        // Get token from cookies
        // -------------------------
        if (req.cookies?.['captain-token']) {
            console.log("✅ Token found in cookies");

            token = req.cookies['captain-token'];

            console.log("🍪 Token exists:", !!token);
            console.log("🍪 Token length:", token.length);
        }

        // -------------------------
        // Get token from Authorization
        // -------------------------
        else if (req.headers.authorization) {
            console.log("✅ Authorization header found");

            const authHeader = req.headers.authorization;

            console.log("🔑 Auth header:", authHeader);

            if (!authHeader.startsWith("Bearer ")) {
                console.log("❌ Invalid Authorization format");

                return res.status(401).json({
                    message: "Invalid authorization format"
                });
            }

            token = authHeader.split(" ")[1];

            console.log("✅ Token extracted from Authorization header");
            console.log("🔑 Token exists:", !!token);
            console.log("🔑 Token length:", token?.length);
        }

        // -------------------------
        // No token
        // -------------------------
        if (!token) {
            console.log("❌ NO TOKEN FOUND");
            console.log("========== AUTH CAPTAIN END ==========\n");

            return res.status(401).json({
                message: "Unauthorized request"
            });
        }

        console.log("🔐 Token received");
        console.log("🔐 Token preview:", token.substring(0, 20) + "...");

        // -------------------------
        // Blacklist check
        // -------------------------
        console.log("🔍 Checking token blacklist...");

        const isBlacklisted = await BlacklistToken.findOne({ token });

        console.log(
            "🚫 Blacklist result:",
            isBlacklisted ? "TOKEN IS BLACKLISTED" : "Token is not blacklisted"
        );

        if (isBlacklisted) {
            console.log("❌ Authentication failed: Blacklisted token");

            return res.status(401).json({
                message: "Unauthorized access"
            });
        }

        // -------------------------
        // Verify JWT
        // -------------------------
        console.log("🔐 Verifying JWT...");

        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("✅ JWT verified successfully");
        console.log("📦 Decoded token:", decodedToken);
        console.log("👨‍✈️ Captain ID:", decodedToken._id);

        // -------------------------
        // Find captain
        // -------------------------
        console.log("🔍 Searching captain in database...");

        const captain = await captainModel.findById(
            decodedToken._id
        );

        if (!captain) {
            console.log("❌ Captain NOT found");
            console.log("❌ Requested captain ID:", decodedToken._id);

            return res.status(401).json({
                message: "Captain not found"
            });
        }

        console.log("✅ Captain found");
        console.log("👨‍✈️ Captain ID:", captain._id);
        console.log("📧 Captain email:", captain.email);

        // -------------------------
        // Attach captain to request
        // -------------------------
        req.captain = captain;

        console.log("✅ req.captain attached");
        console.log("👨‍✈️ req.captain._id:", req.captain._id);

        console.log("🎉 CAPTAIN AUTHENTICATION SUCCESSFUL");
        console.log("========== AUTH CAPTAIN END ==========\n");

        next();

    } catch (error) {

        console.log("\n❌❌❌ AUTH CAPTAIN ERROR ❌❌❌");
        console.log("Error name:", error.name);
        console.log("Error message:", error.message);
        console.log("Error stack:", error.stack);
        console.log("=======================================\n");

        if (error.name === "JsonWebTokenError") {
            console.log("❌ JWT is invalid");

            return res.status(401).json({
                message: "Invalid token"
            });
        }

        if (error.name === "TokenExpiredError") {
            console.log("❌ JWT has expired");

            return res.status(401).json({
                message: "Token expired"
            });
        }

        next(error);
    }
};


export default authCaptain;

export {
    authUser,
    authCaptain
};