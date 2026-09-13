import express from "express";
import { imagekit } from "../utils/imagekit.js";

const router = express.Router();

router.get("/auth", (req, res) => {
    try {
        const authenticationParameters = imagekit.getAuthenticationParameters();
        res.status(200).json(authenticationParameters);
    } catch (error) {
        console.error("ImageKit Auth Error:", error);
        res.status(500).json({ message: "Failed to generate authentication parameters" });
    }
});

export default router;
