import { getPassengerAssistant } from "../ai/agents/passenger.agent.js";
import { v4 as uuidv4 } from "uuid";
import logger from "../utils/logger.js";
import { HumanMessage } from "@langchain/core/messages";

export const chatWithPassengerAssistant = async (req, res, next) => {
    try {
        const { message, threadId } = req.body;
        const userId = req.user._id;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        let thread = threadId || uuidv4();
        const agent = await getPassengerAssistant();

        let config = { configurable: { thread_id: thread } };
        
        // Pass the user input into the graph
        let result = await agent.invoke({
            messages: [new HumanMessage(message)],
            userId: userId
        }, config);

        if (!result) {
            logger.warn(`Thread ${thread} returned undefined result, generating new thread...`);
            thread = uuidv4();
            config = { configurable: { thread_id: thread } };
            result = await agent.invoke({
                messages: [new HumanMessage(message)],
                userId: userId
            }, config);
        }

        if (!result || !result.messages) {
            throw new Error("Agent failed to process the message and returned an empty state.");
        }

        // Get the last message which is the agent response
        const messages = result.messages;
        const finalMessage = messages[messages.length - 1];

        let responseText = finalMessage.content;
        if (Array.isArray(responseText)) {
            // Gemini sometimes returns an array of content blocks
            responseText = responseText.map(b => b.text || "").join("\n");
        }

        res.json({
            threadId: thread,
            response: responseText
        });

    } catch (error) {
        import("fs").then(fs => fs.writeFileSync("ai_error.txt", error.stack || error.toString()));
        console.error(error.stack);
        logger.error({ error }, "Error in passenger assistant");
        next(error);
    }
};

import { getInvestigationAgent } from "../ai/agents/investigation.agent.js";

export const chatWithInvestigationAgent = async (req, res, next) => {
    try {
        const { message, threadId } = req.body;
        const userId = req.user._id;

        if (!message) return res.status(400).json({ error: "Message is required" });

        const thread = threadId || uuidv4();
        const agent = await getInvestigationAgent();
        const config = { configurable: { thread_id: thread } };
        
        // Pass userId so the agent can use get_ride_history
        const result = await agent.invoke({
            messages: [new HumanMessage(`My user ID is ${userId}. ${message}`)],
            userId: userId
        }, config);

        const messages = result.messages;
        res.json({
            threadId: config.configurable.thread_id,
            response: messages[messages.length - 1].content
        });
    } catch (error) {
        logger.error({ error }, "Error in investigation agent");
        next(error);
    }
};

import { getCaptainAgent } from "../ai/agents/captain.agent.js";

export const chatWithCaptainAssistant = async (req, res, next) => {
    try {
        const { message, threadId } = req.body;
        const captainId = req.captain._id;

        if (!message) return res.status(400).json({ error: "Message is required" });

        const thread = threadId || uuidv4();
        const agent = await getCaptainAgent();
        const config = { configurable: { thread_id: thread } };
        
        const result = await agent.invoke({
            messages: [new HumanMessage(message)],
            captainId: captainId
        }, config);

        const messages = result.messages;
        res.json({
            threadId: thread,
            response: messages[messages.length - 1].content
        });
    } catch (error) {
        logger.error({ error }, "Error in captain agent");
        next(error);
    }
};

import { CheckpointModel } from "../ai/memory/conversation.store.js";

export const getThreadTrace = async (req, res, next) => {
    try {
        const { threadId } = req.params;
        const doc = await CheckpointModel.findOne({ thread_id: threadId }).sort({ createdAt: -1 });
        if (!doc) return res.status(404).json({ error: "Thread not found" });
        
        const messages = doc.checkpoint?.channel_values?.messages || [];
        
        // Map Langchain messages to a readable format
        const trace = messages.map(m => {
            // LangChain serializes messages with a .type field ("human", "ai", "tool", "system")
            let role = "ai";
            if (m.type === "human") role = "user";
            else if (m.type === "system") role = "system";
            else if (m.type === "tool") role = "tool_response";
            
            let content = m.content || m.lc_kwargs?.content;
            if (typeof content !== "string" && content != null) {
                content = JSON.stringify(content, null, 2);
            }
            
            return {
                role,
                content: content,
                tool_calls: m.tool_calls || m.lc_kwargs?.tool_calls,
                tool_name: m.name || m.lc_kwargs?.name
            };
        });

        res.json({
            threadId,
            trace
        });
    } catch (error) {
        next(error);
    }
};
