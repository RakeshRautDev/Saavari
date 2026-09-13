import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import logger from "../../utils/logger.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mcpClient = null;
let langchainTools = [];

export const initializeMcpClient = async () => {
    if (mcpClient) return langchainTools;
    
    // Spawn the local MCP server
    const serverPath = path.resolve(__dirname, "../../mcp-server/server.js");
    const transport = new StdioClientTransport({
        command: "node",
        args: [serverPath],
    });

    mcpClient = new Client({ name: "langgraph-agent", version: "1.0.0" });
    await mcpClient.connect(transport);
    
    logger.info("Connected to MCP Server");

    const { tools } = await mcpClient.listTools();
    
    langchainTools = tools.map((t) => {
        // Convert MCP inputSchema to zod (simplified mapping for this demo)
        const props = t.inputSchema.properties || {};
        const zShape = {};
        for (const [key, val] of Object.entries(props)) {
            if (val.enum && Array.isArray(val.enum)) {
                zShape[key] = z.enum(val.enum);
            } else if (val.type === "string") {
                zShape[key] = z.string();
            } else if (val.type === "number") {
                zShape[key] = z.number();
            } else if (val.type === "boolean") {
                zShape[key] = z.boolean();
            } else {
                zShape[key] = z.any();
            }
        }
        
        return tool(
            async (args) => {
                const response = await mcpClient.callTool({
                    name: t.name,
                    arguments: args
                });
                if (response.isError) throw new Error(response.content[0].text);
                return response.content[0].text;
            },
            {
                name: t.name,
                description: t.description,
                schema: z.object(zShape)
            }
        );
    });

    return langchainTools;
};

export const getMcpTools = () => langchainTools;
