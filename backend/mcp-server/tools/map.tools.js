import { getDistanceTime, getAddressCoordinate, getReverseGeocoding } from "../../services/maps.service.js";
import axios from "axios";
import env from "../../config/env.js";

const API_KEY = env.GEOAPIFY_API_KEY;



const findNearbyPlaces = async (lat, lng, category, radiusMeters = 2000, limit = 5) => {
    const response = await axios.get("https://api.geoapify.com/v2/places", {
        params: {
            categories: category,
            filter: `circle:${lng},${lat},${radiusMeters}`,
            bias: `proximity:${lng},${lat}`,
            limit,
            apiKey: API_KEY
        }
    });
    return response.data.features.map(f => ({
        name: f.properties.name || f.properties.formatted,
        address: f.properties.formatted,
        lat: f.properties.lat,
        lng: f.properties.lon,
        distance_m: f.properties.distance
    }));
};

const getIsoline = async (lat, lng, type = "time", value = 900, mode = "drive") => {
    const response = await axios.get("https://api.geoapify.com/v1/isoline", {
        params: { lat, lon: lng, type, range: value, mode, apiKey: API_KEY }
    });
    const feature = response.data.features?.[0];
    if (!feature) throw new Error("Isoline could not be calculated.");
    const rangeLabel = type === "time" ? `${Math.round(value / 60)} minutes` : `${(value / 1000).toFixed(1)} km`;
    const areaKm2 = feature.properties?.area ? (feature.properties.area / 1e6).toFixed(2) : null;
    return {
        summary: `Reachable area within ${rangeLabel} by ${mode}${areaKm2 ? ` (~${areaKm2} km²)` : ""}`,
        type, value, mode,
        polygon: feature.geometry
    };
};

const getRouteMatrix = async (origins, destinations, mode = "drive") => {
    const formatWaypoints = pts => pts.map(p => `${p.lat},${p.lng}`).join("|");
    const response = await axios.get("https://api.geoapify.com/v1/routematrix", {
        params: {
            waypoints: formatWaypoints(origins),
            destinations: formatWaypoints(destinations),
            mode,
            apiKey: API_KEY
        }
    });
    const matrix = response.data.sources_to_targets || [];
    return origins.map((o, i) => ({
        origin: o.label || `${o.lat},${o.lng}`,
        routes: (matrix[i] || []).map((cell, j) => ({
            destination: destinations[j].label || `${destinations[j].lat},${destinations[j].lng}`,
            distance_km: cell.distance ? (cell.distance / 1000).toFixed(2) : null,
            duration_min: cell.time ? (cell.time / 60).toFixed(1) : null
        }))
    }));
};

// === Tool Definitions ===
export default [
    {
        name: "get_distance_time",
        description: "Calculate driving distance and travel time between two string addresses",
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
        name: "geocode_address",
        description: "Get latitude and longitude for a string address",
        inputSchema: {
            type: "object",
            properties: { address: { type: "string" } },
            required: ["address"]
        }
    },
    {
        name: "find_nearby_places",
        description: "Find nearby points of interest (restaurants, hospitals, ATMs, etc.) near a location. Use category codes: 'catering.restaurant', 'catering.cafe', 'healthcare.hospital', 'commercial.supermarket', 'amenity.fuel', 'tourism.attraction'.",
        inputSchema: {
            type: "object",
            properties: {
                lat: { type: "number", description: "Latitude of the center point" },
                lng: { type: "number", description: "Longitude of the center point" },
                category: { type: "string", description: "Geoapify place category code" },
                radius_meters: { type: "number", description: "Search radius in meters (default 2000)" },
                limit: { type: "number", description: "Max results to return (default 5)" }
            },
            required: ["lat", "lng", "category"]
        }
    },
    {
        name: "get_reachable_area",
        description: "Calculate the area reachable from a location within a given time or distance. Useful for questions like 'what can I reach in 15 minutes?'",
        inputSchema: {
            type: "object",
            properties: {
                lat: { type: "number" },
                lng: { type: "number" },
                type: { type: "string", enum: ["time", "distance"], description: "'time' (value in seconds) or 'distance' (value in meters)" },
                value: { type: "number", description: "Range value: seconds if type=time, meters if type=distance" },
                mode: { type: "string", enum: ["drive", "walk", "bicycle"], description: "Travel mode (default: drive)" }
            },
            required: ["lat", "lng", "type", "value"]
        }
    },
    {
        name: "get_route_matrix",
        description: "Calculate distances and travel times from multiple origin points to multiple destination points in one call. Useful for finding the nearest driver or comparing multiple route options.",
        inputSchema: {
            type: "object",
            properties: {
                origins: {
                    type: "array",
                    description: "Array of origin points with lat, lng, and optional label",
                    items: {
                        type: "object",
                        properties: {
                            lat: { type: "number" },
                            lng: { type: "number" },
                            label: { type: "string" }
                        }
                    }
                },
                destinations: {
                    type: "array",
                    description: "Array of destination points with lat, lng, and optional label",
                    items: {
                        type: "object",
                        properties: {
                            lat: { type: "number" },
                            lng: { type: "number" },
                            label: { type: "string" }
                        }
                    }
                },
                mode: { type: "string", enum: ["drive", "walk", "bicycle"], description: "Travel mode (default: drive)" }
            },
            required: ["origins", "destinations"]
        }
    }
];

export async function executeMapTool(name, args) {
    let result;
    switch (name) {
        case "get_distance_time":
            result = await getDistanceTime(args.pickup, args.destination);
            break;
        case "geocode_address":
            result = await getAddressCoordinate(args.address);
            break;
        case "find_nearby_places":
            result = await findNearbyPlaces(args.lat, args.lng, args.category, args.radius_meters, args.limit);
            break;
        case "get_reachable_area":
            result = await getIsoline(args.lat, args.lng, args.type, args.value, args.mode || "drive");
            break;
        case "get_route_matrix":
            result = await getRouteMatrix(args.origins, args.destinations, args.mode || "drive");
            break;
    }
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
}

