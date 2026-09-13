import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import mongoose from "mongoose";
import env from "../config/env.js";

// Import tools
import rideTools, { executeRideTool } from "./tools/ride.tools.js";
import mapTools, { executeMapTool } from "./tools/map.tools.js";
import captainTools, { executeCaptainTool } from "./tools/captain.tools.js";
import policyTools, { executePolicyTool } from "./tools/policy.tools.js";

const server = new Server(
    { name: "ride-platform-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } }
);

const tools = [...rideTools, ...mapTools, ...captainTools, ...policyTools];

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        if (rideTools.find(t => t.name === name)) {
            return await executeRideTool(name, args);
        }
        if (mapTools.find(t => t.name === name)) {
            return await executeMapTool(name, args);
        }
        if (captainTools.find(t => t.name === name)) {
            return await executeCaptainTool(name, args);
        }
        if (policyTools.find(t => t.name === name)) {
            return await executePolicyTool(name, args);
        }
        
        throw new Error(`Tool not found: ${name}`);
    } catch (error) {
        return {
            content: [{ type: "text", text: `Error executing ${name}: ${error.message}` }],
            isError: true,
        };
    }
});

async function run() {
    await mongoose.connect(env.DB_CONNECT);
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Ride Platform MCP Server running on stdio");
}

run().catch((error) => {
    console.error("Fatal error running MCP server:", error);
    process.exit(1);
});
