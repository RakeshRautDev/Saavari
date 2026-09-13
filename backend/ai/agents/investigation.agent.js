import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { initializeMcpClient, getMcpTools } from "../tools/mcp.client.js";
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

const InvestigationState = Annotation.Root({
    messages: Annotation({
        reducer: (x, y) => x.concat(y),
        default: () => [],
    }),
    userId: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => null,
    }),
    rideId: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => null,
    })
});

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-3.6-flash",
    temperature: 0.1, // very analytical
    apiKey: env.GEMINI_API_KEY
});

const agentNode = async (state) => {
    const tools = getMcpTools();
    const modelWithTools = llm.bindTools(tools);
    
    const systemPrompt = {
        role: "system",
        content: `You are the Uber AI Investigation Agent. The current user's ID is ${state.userId}.
Your job is to investigate passenger complaints, delays, or ride issues.
You have access to get_ride_history, get_ride_status, and search_policy.
Analyze the timeline, distance, and status to explain to the user what went wrong or why there is a delay. Answer policy questions.`
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
    while (recentMessages.length > 0 && recentMessages[0].type !== 'human') {
        recentMessages.shift();
    }
    
    // Filter out duplicate consecutive human messages
    let filteredMessages = [];
    for (let i = 0; i < recentMessages.length; i++) {
        if (i < recentMessages.length - 1 && recentMessages[i].type === 'human' && recentMessages[i+1].type === 'human') continue;
        filteredMessages.push(recentMessages[i]);
    }
    
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
        } catch (e) {}
    }

    return { messages: [response] };
};

const routeAfterAgent = (state) => {
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage?.tool_calls?.length > 0) return "tools";
    return END;
};

let workflowCompiled = null;

export const getInvestigationAgent = async () => {
    if (workflowCompiled) return workflowCompiled;

    const tools = await initializeMcpClient();

    const workflow = new StateGraph(InvestigationState)
        .addNode("agent", agentNode)
        .addNode("tools", async (state) => {
            const toolNode = new ToolNode(tools);
            const cleanMessages = state.messages.map(ensureBaseMessage);
            return { messages: await toolNode.invoke(cleanMessages) };
        })
        .addEdge(START, "agent")
        .addConditionalEdges("agent", routeAfterAgent)
        .addEdge("tools", "agent");

    // We can use the same Checkpointer or run statelessly depending on use-case
    workflowCompiled = workflow.compile();
    
    logger.info("Investigation Agent LangGraph Compiled");
    return workflowCompiled;
};
