import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDb from "./db/db.js";
import logger from "./utils/logger.js";

import userRoutes from "./routes/user.routes.js";
import captainRoutes from "./routes/captain.routes.js";
import mapsRoutes from "./routes/maps.route.js";
import rideRoutes from "./routes/ride.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import imagekitRoutes from "./routes/imagekit.routes.js";

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

connectDb();

// Health check
app.get("/", (req, res) => {
    res.json({ status: "ok", service: "uber-backend" });
});

// ── Routes (all before error handler) ──────────────────────────────────────
app.use("/users", userRoutes);
app.use("/captains", captainRoutes);
app.use("/maps", mapsRoutes);
app.use("/rides", rideRoutes);
app.use("/ai", aiRoutes);
app.use("/imagekit", imagekitRoutes);

// Simple admin stats route
import { rideModel } from "./models/ride.model.js";
import { captainModel } from "./models/captain.model.js";

app.get("/admin/stats", async (req, res) => {
    try {
        const rides = await rideModel.countDocuments();
        const captains = await captainModel.countDocuments();
        const activeCaptains = await captainModel.countDocuments({ status: "active" });
        const completedRides = await rideModel.countDocuments({ status: "completed" });
        
        res.json({
            totalRides: rides,
            totalCaptains: captains,
            activeCaptains,
            completedRides
        });
    } catch (e) {
        res.status(500).json({ error: "Failed to get stats" });
    }
});

// ── Global error handler (MUST be last) ────────────────────────────────────
app.use((err, req, res, next) => {
    logger.error({ err, url: req.originalUrl }, "Unhandled error");
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error"
    });
});

export default app;