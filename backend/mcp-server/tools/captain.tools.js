import { rideModel } from "../../models/ride.model.js";

export default [
    {
        name: "get_captain_stats",
        description: "Get analytics for a captain (rides completed, total earnings)",
        inputSchema: {
            type: "object",
            properties: {
                captainId: { type: "string" }
            },
            required: ["captainId"]
        }
    }
];

export async function executeCaptainTool(name, args) {
    let result;
    switch (name) {
        case "get_captain_stats":
            const rides = await rideModel.find({ captain: args.captainId, status: "completed" });
            const earnings = rides.reduce((sum, ride) => sum + (ride.fare || 0), 0);
            result = {
                totalRides: rides.length,
                totalEarnings: earnings
            };
            break;
    }
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
}
