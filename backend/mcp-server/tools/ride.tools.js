import { rideModel } from "../../models/ride.model.js";
import { getFare } from "../../services/fare.service.js";

export default [
    {
        name: "get_ride_status",
        description: "Get the current status of a ride by ID",
        inputSchema: {
            type: "object",
            properties: { rideId: { type: "string" } },
            required: ["rideId"]
        }
    },
    {
        name: "estimate_fare",
        description: "Get a fare estimate for a route",
        inputSchema: {
            type: "object",
            properties: {
                pickup: { type: "string" },
                destination: { type: "string" }
            },
            required: ["pickup", "destination"]
        }
    },
    {
        name: "draft_ride",
        description: "Draft a new ride for the user to confirm. Always use this to help a user book a ride. Never claim you booked it yourself. The vehicleType must be exactly one of: 'auto', 'car', 'motorcycle'.",
        inputSchema: {
            type: "object",
            properties: {
                pickup: { type: "string" },
                destination: { type: "string" },
                vehicleType: { type: "string", enum: ["auto", "car", "motorcycle"] }
            },
            required: ["pickup", "destination", "vehicleType"]
        }
    },
    {
        name: "draft_cancel",
        description: "Draft a ride cancellation for the user to confirm.",
        inputSchema: {
            type: "object",
            properties: {
                rideId: { type: "string" }
            },
            required: ["rideId"]
        }
    },
    {
        name: "get_ride_history",
        description: "Get the ride history for a user. Returns a list of past rides with their statuses.",
        inputSchema: {
            type: "object",
            properties: {
                userId: { type: "string" }
            },
            required: ["userId"]
        }
    },
    {
        name: "search_location",
        description: "Search for a location to get the exact verified address. Always use this to verify vague user locations before drafting a ride.",
        inputSchema: {
            type: "object",
            properties: {
                query: { type: "string", description: "The location string to search for (e.g. 'iter boys hostel')" }
            },
            required: ["query"]
        }
    }
];

export async function executeRideTool(name, args) {
    let result;
    switch (name) {
        case "search_location":
            const { getAutoCompleteSuggestions } = await import("../../services/maps.service.js");
            const suggestions = await getAutoCompleteSuggestions(args.query);
            result = { suggestions: suggestions.map(s => s.address) };
            break;
        case "get_ride_status":
            const ride = await rideModel.findById(args.rideId).populate("captain");
            if (!ride) throw new Error("Ride not found");
            result = { status: ride.status, captain: ride.captain?.fullname };
            break;
        case "estimate_fare":
            result = await getFare(args.pickup, args.destination);
            break;
        case "draft_ride":
            // Provide a structured UI payload back to the agent so it can render a button
            const fareEstimates = await getFare(args.pickup, args.destination);
            result = {
                ui_action: "CONFIRM_RIDE_WIDGET",
                draft: {
                    pickup: args.pickup,
                    destination: args.destination,
                    vehicleType: args.vehicleType,
                    estimatedFare: fareEstimates[args.vehicleType]
                }
            };
            break;
        case "draft_cancel":
            result = {
                ui_action: "CONFIRM_CANCEL_WIDGET",
                draft: {
                    rideId: args.rideId
                }
            };
            break;
        case "get_ride_history":
            result = await rideModel.find({ user: args.userId })
                .populate("captain", "fullname vehicle")
                .sort({ createdAt: -1 })
                .limit(10);
            break;
    }
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
}
