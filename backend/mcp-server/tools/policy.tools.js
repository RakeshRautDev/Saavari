
export default [
    {
        name: "search_policy",
        description: "Search the company policy handbook (cancellations, fares, guidelines)",
        inputSchema: {
            type: "object",
            properties: {
                query: { type: "string", description: "What policy to look up" }
            },
            required: ["query"]
        }
    }
];

const POLICIES = `
# Cancellation Policy
- Passengers can cancel for free within 5 minutes of booking.
- After 5 minutes, a ?50 fee applies.
- Captains can cancel for free if they wait more than 10 minutes at the pickup location.

# Fare Policy
- Auto: Base ?30, ?10/km, ?2/min
- Car: Base ?50, ?15/km, ?3/min
- Motorcycle: Base ?20, ?8/km, ?1.5/min
- Night time surge (11PM-5AM): 1.5x multiplier.

# Safety Guidelines
- Captains must not exceed speed limits.
- Passengers must wear seatbelts in cars, and helmets on motorcycles.
`;

export async function executePolicyTool(name, args) {
    if (name === "search_policy") {
        // Very rudimentary RAG (just returns the document for the LLM to parse)
        // In a production app, this would query ChromaDB.
        return { content: [{ type: "text", text: POLICIES }] };
    }
}
