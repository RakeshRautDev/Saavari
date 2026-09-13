import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph, START, END } from "@langchain/langgraph";
import { PassengerGraphState } from "../state/ride.state.js";
import { initializeMcpClient, getMcpTools } from "../tools/mcp.client.js";
import { MongoDBSaver } from "../memory/conversation.store.js";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { HumanMessage, AIMessage, ToolMessage, SystemMessage } from "@langchain/core/messages";
import logger from "../../utils/logger.js";
import env from "../../config/env.js";

const ensureBaseMessage = (m) => {
    if (m.getType) return m;
    if (m.type === 'human') return new HumanMessage(m);
    if (m.type === 'ai') return new AIMessage(m);
    if (m.type === 'tool') return new ToolMessage(m);
    if (m.type === 'system') return new SystemMessage(m);
    return new HumanMessage(m.content || m);
};

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-3.6-flash",
    temperature: 0.2,
    apiKey: env.GEMINI_API_KEY,
    maxRetries: 3
});

// Node: Agent thinking and tool calling
const agentNode = async (state) => {
    const tools = getMcpTools();
    const modelWithTools = llm.bindTools(tools);
    
    // Inject system prompt mapping to the intent and tools
    const systemPrompt = {
        role: "system",
        content: `You are the Uber AI Passenger Assistant. The current user's ID is ${state.userId}.

CAPABILITIES:
- Ride booking: search_location → draft_ride → user confirms
- Fare estimates: estimate_fare
- Ride status & history: get_ride_status, get_ride_history
- Cancel rides: draft_cancel → user confirms
- Nearby places: geocode_address first, then find_nearby_places (use proper category codes)
- Reachable area: geocode_address first, then get_reachable_area
- Multi-route comparison: get_route_matrix
- Policies: search_policy

RULES:
1. When booking, always call search_location first to get the verified address, then draft_ride.
2. For "find me a restaurant/cafe/hospital near X", geocode X first, then call find_nearby_places.
3. For "what can I reach in 15 minutes", geocode the location, then call get_reachable_area with value=900 (seconds).
4. When you draft a ride or cancel, output the exact JSON from the tool result wrapped in \`\`\`json block. No other text.
5. Be concise. Answer in 2-3 sentences max unless listing results.`
    };

    // Safely trim message history to save tokens while keeping valid Gemini sequence
    let recentMessages = [];
    let count = 0;
    for (let i = state.messages.length - 1; i >= 0; i--) {
        const m = state.messages[i];
        recentMessages.unshift(m);
        count++;
        if (count >= 6 && m.type === 'human') {
            break;
        }
    }
    // Double check that it starts with human message (Gemini strictly requires this)
    // Double check that it starts with human message (Gemini strictly requires this)
    while (recentMessages.length > 0 && recentMessages[0].type !== 'human') {
        recentMessages.shift();
    }
    
    // Filter out duplicate consecutive human messages (only keep the latest one)
    let filteredMessages = [];
    for (let i = 0; i < recentMessages.length; i++) {
        if (
            i < recentMessages.length - 1 && 
            recentMessages[i].type === 'human' && 
            recentMessages[i+1].type === 'human'
        ) {
            continue; // Skip this one, keep the next one
        }
        filteredMessages.push(recentMessages[i]);
    }
    
    console.log("SENDING TO GEMINI:", JSON.stringify(filteredMessages.map(m => m.type), null, 2));
    
    let response = await modelWithTools.invoke([systemPrompt, ...filteredMessages]);
    
    // Fix Ollama 3B native tool calling hallucination
    if (!response.tool_calls || response.tool_calls.length === 0) {
        let text = response.content || "";
        const match = text.match(/```(?:json)?\s*({[\s\S]*?})\s*```/) || [null, text];
        try {
            const potentialJson = match[1].trim();
            if (potentialJson.startsWith('{') && potentialJson.includes('"name"')) {
                const parsed = JSON.parse(potentialJson);
                if (parsed.name && parsed.parameters) {
                    response.tool_calls = [{
                        name: parsed.name,
                        args: parsed.parameters,
                        id: "call_" + Math.random().toString(36).substring(7),
                        type: "tool_call"
                    }];
                    response.content = ""; // Clear content so it doesn't render
                }
            }
        } catch (e) {
            // Ignore parse errors
        }
    }

    return { messages: [response] };
};

// Edge routing: do we call a tool or end?
const routeAfterAgent = (state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage?.tool_calls?.length > 0) {
        return "tools";
    }
    return END;
};

let workflowCompiled = null;

export const getPassengerAssistant = async () => {
    if (workflowCompiled) return workflowCompiled;

    // Ensure tools are loaded from MCP
    const tools = await initializeMcpClient();

    const workflow = new StateGraph(PassengerGraphState)
        .addNode("agent", agentNode)
        .addNode("tools", async (state) => {
            const toolNode = new ToolNode(tools);
            const cleanMessages = state.messages.map(ensureBaseMessage);
            return { messages: await toolNode.invoke(cleanMessages) };
        })
        .addEdge(START, "agent")
        .addConditionalEdges("agent", routeAfterAgent)
        .addEdge("tools", "agent"); // Return to agent after tool execution

    const checkpointer = new MongoDBSaver();
    workflowCompiled = workflow.compile({ checkpointer });
    
    logger.info("Passenger Agent LangGraph Compiled");
    return workflowCompiled;
};
