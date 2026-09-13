import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.js";
import { chatWithPassengerAssistant, chatWithInvestigationAgent } from "../controllers/ai.controller.js";

const router = Router();

router.post("/chat", authUser, chatWithPassengerAssistant);

router.post("/investigate", authUser, chatWithInvestigationAgent);

import authCaptain from "../middleware/auth.middleware.js";
import { chatWithCaptainAssistant, getThreadTrace } from "../controllers/ai.controller.js";

router.post("/captain-chat", authCaptain, chatWithCaptainAssistant);

router.get("/trace/:threadId", getThreadTrace);

export default router;
