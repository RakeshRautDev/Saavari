import { Server } from "socket.io";
import { User } from "./models/user.model.js";
import { captainModel } from "./models/captain.model.js";
import { rideModel } from "./models/ride.model.js";
import logger from "./utils/logger.js";
import { updateCaptainLocationInRedis, removeCaptainFromRedis } from "./services/location.service.js";

let io;

// Throttle map: captainId → last DB-write timestamp (ms)
const locationWriteThrottle = new Map();
const LOCATION_WRITE_INTERVAL_MS = 10000; // write to DB at most once every 10s

const initializeSocket = (server) => {
    const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
    io = new Server(server, {
        cors: { origin: corsOrigin, credentials: true }
    });

    io.on("connection", (socket) => {
        logger.info({ socketId: socket.id }, "Client connected");

        socket.on("join", async (data) => {
            const { userId, userType } = data;
            // Store mapping on the socket for disconnect handling
            socket.data.userId = userId;
            socket.data.userType = userType;

            if (userType === "user") {
                await User.findByIdAndUpdate(userId, { socketId: socket.id });
                logger.info({ userId }, "User joined");
            } else {
                await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
                logger.info({ userId }, "Captain joined");
            }
        });

        socket.on("update-location-captain", async (data) => {
            const { userId, location } = data;

            if (!location || !location.lat || !location.lng) {
                return socket.emit("error", { message: "Invalid location data" });
            }

            // 1. Instantly write to Redis for fast discovery
            updateCaptainLocationInRedis(userId, location.lat, location.lng);

            // 2. Throttle write to MongoDB for persistence (10s)
            const now = Date.now();
            const lastWrite = locationWriteThrottle.get(userId) || 0;

            if (now - lastWrite >= LOCATION_WRITE_INTERVAL_MS) {
                locationWriteThrottle.set(userId, now);
                captainModel.findByIdAndUpdate(userId, {
                    location: { type: "Point", coordinates: [location.lng, location.lat] }
                }).catch(err => logger.error({ err }, "Error updating captain location in DB"));
            }

            // Always forward location to the active ride's user immediately
            try {
                const activeRide = await rideModel.findOne({
                    captain: userId,
                    status: { $in: ["accepted", "ongoing"] }
                }).populate("user");

                if (activeRide?.user?.socketId) {
                    sendMessageToSocketId(activeRide.user.socketId, "captain-location-update", {
                        lat: location.lat,
                        lng: location.lng
                    });
                }
            } catch (error) {
                logger.error({ error }, "Error forwarding location to user");
            }
        });

        socket.on("send-chat-message", async (data) => {
            const { rideId, message, senderType } = data;
            
            try {
                const ride = await rideModel.findById(rideId).populate("user").populate("captain");
                if (!ride) return;
                
                const chatMsg = { senderType, content: message, timestamp: new Date() };
                ride.messages.push(chatMsg);
                await ride.save();

                const recipientSocketId = senderType === "user" ? ride.captain?.socketId : ride.user?.socketId;

                if (recipientSocketId) {
                    sendMessageToSocketId(recipientSocketId, "receive-chat-message", chatMsg);
                }
            } catch (error) {
                logger.error({ error }, "Error handling chat message");
            }
        });

        socket.on("disconnect", () => {
            logger.info({ socketId: socket.id }, "Client disconnected");
            if (socket.data.userType === "captain" && socket.data.userId) {
                removeCaptainFromRedis(socket.data.userId);
            }
        });
    });

    return io;
};

const sendMessageToSocketId = (socketId, event, message) => {
    if (!io) {
        logger.warn("Socket.io not initialized — cannot send message");
        return;
    }
    io.to(socketId).emit(event, message);
};

export { initializeSocket, sendMessageToSocketId };