import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.js";
import { chatWithPassengerAssistant, chatWithInvestigationAgent } from "../controllers/ai.controller.js";

const router = Router();

// Passenger Assistant
router.post("/chat", authUser, chatWithPassengerAssistant);

// Investigation Agent
router.post("/investigate", authUser, chatWithInvestigationAgent);

import authCaptain from "../middleware/auth.middleware.js";
import { chatWithCaptainAssistant, getThreadTrace } from "../controllers/ai.controller.js";

// Captain Assistant
router.post("/captain-chat", authCaptain, chatWithCaptainAssistant);

// Debugging trace route
router.get("/trace/:threadId", getThreadTrace);

export default router;
