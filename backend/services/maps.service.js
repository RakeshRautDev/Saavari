import axios from "axios";
import { captainModel } from "../models/captain.model.js";
import logger from "../utils/logger.js";

export const getAddressCoordinate = async (address) => {
    try {
        const response = await axios.get(
            "https://api.geoapify.com/v1/geocode/search",
            {
                params: {
                    text: address,
                    apiKey: process.env.GEOAPIFY_API_KEY,
                },
            }
        );

        if (!response.data.features?.length) {
            throw new Error("Location not found");
        }

        const properties = response.data.features[0].properties;

        return {
            lat: properties.lat,
            lng: properties.lon,
        };

    } catch (error) {
        console.error(
            "Geocoding error:",
            error.response?.data || error.message
        );

        throw new Error("Unable to find location");
    }
};




export const getDistanceTime = async (origin, destination) => {
    try {
        const getCoords = async (loc) => {
            if (typeof loc === 'string' && loc.match(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/)) {
                const [lat, lng] = loc.split(',');
                return { lat: parseFloat(lat), lng: parseFloat(lng) };
            }
            return await getAddressCoordinate(loc);
        };

        const originCoordinates = await getCoords(origin);
        const destinationCoordinates = await getCoords(destination);

        const response = await axios.get(
            "https://api.geoapify.com/v1/routing",
            {
                params: {
                    waypoints: `${originCoordinates.lat},${originCoordinates.lng}|${destinationCoordinates.lat},${destinationCoordinates.lng}`,
                    mode: "drive",
                    apiKey: process.env.GEOAPIFY_API_KEY
                }
            }
        );

        const route = response.data.features[0];

        if (!route) {
            throw new Error("Route not found");
        }

        return {
            distance: route.properties.distance, // meters
            duration: route.properties.time      // seconds
        };

    } catch (error) {
        console.error(
            "Distance/Time error:",
            error.response?.data || error.message
        );

        throw new Error("Unable to calculate distance and time");
    }
};


export const getAutoCompleteSuggestions = async (input) => {
    try {
        const response = await axios.get(
            "https://api.geoapify.com/v1/geocode/autocomplete",
            {
                params: {
                    text: input,
                    apiKey: process.env.GEOAPIFY_API_KEY,
                    limit: 5
                }
            }
        );

        return response.data.features.map((item) => ({
            address: item.properties.formatted,
            lat: item.properties.lat,
            lng: item.properties.lon
        }));

    } catch (error) {
        console.error(
            "Autocomplete error:",
            error.response?.data || error.message
        );

        throw new Error("Unable to fetch location suggestions");
    }
};

import { getCaptainsInRadiusRedis } from "./location.service.js";

export const getCaptainsInTheRadius = async (lat, lng, radiusKm) => {
    logger.info({ lat, lng, radiusKm }, "Searching for captains in radius via Redis");

    // 1. Try fast ephemeral Redis first
    const redisCaptains = await getCaptainsInRadiusRedis(lat, lng, radiusKm);
    
    if (redisCaptains.length > 0) {
        // Fetch full objects from Mongo
        return captainModel.find({ _id: { $in: redisCaptains }, status: "active" });
    }

    logger.info("No active captains in Redis, falling back to Mongo $near");

    // 2. Fallback to MongoDB
    return captainModel.find({
        status: "active",
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [lng, lat]
                },
                $maxDistance: radiusKm * 1000 // meters
            }
        },
        socketId: { $exists: true, $ne: null }
    });
};


export const getReverseGeocoding = async (lat, lng) => {
    try {
        const response = await axios.get(
            "https://api.geoapify.com/v1/geocode/reverse",
            {
                params: {
                    lat: lat,
                    lon: lng,
                    apiKey: process.env.GEOAPIFY_API_KEY,
                },
            }
        );

        if (!response.data.features?.length) {
            throw new Error("Address not found");
        }

        return response.data.features[0].properties.formatted;

    } catch (error) {
        console.error(
            "Reverse geocoding error:",
            error.response?.data || error.message
        );
        throw new Error("Unable to fetch address");
    }
};

export const getRouteService = async (
    pickup,
    destination,
    vehicleType = null
) => {
    try {
        const getCoordinates = async (address) => {
            // Check if address is already "lat,lng"
            if (typeof address === 'string' && address.match(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/)) {
                const [lat, lng] = address.split(',');
                return { lat: parseFloat(lat), lng: parseFloat(lng) };
            }

            const response = await axios.get(
                "https://api.geoapify.com/v1/geocode/search",
                {
                    params: {
                        text: address,
                        apiKey: process.env.GEOAPIFY_API_KEY,
                        limit: 1
                    }
                }
            );
            if (!response.data.features.length) {
                throw new Error(`Location not found: ${address}`);
            }

            const properties = response.data.features[0].properties;

            return {
                lat: properties.lat,
                lng: properties.lon
            };
        };

        const pickupCoords = await getCoordinates(pickup);
        const destinationCoords = await getCoordinates(destination);

        const response = await axios.get(
            "https://api.geoapify.com/v1/routing",
            {
                params: {
                    waypoints:
                        `${pickupCoords.lat},${pickupCoords.lng}|` +
                        `${destinationCoords.lat},${destinationCoords.lng}`,
                    mode: vehicleType || "drive",
                    apiKey: process.env.GEOAPIFY_API_KEY
                }
            }
        );

        if (!response.data.features || !response.data.features.length) {
            throw new Error("Route not found");
        }
        
        const route = response.data.features[0];
        const legs = route.properties.legs;
        let instructions = [];
        if (legs && legs.length > 0 && legs[0].steps) {
            instructions = legs[0].steps.map(step => step.instruction?.text || "");
        }

        // Geoapify returns [lng, lat], we need [lat, lng].
        // It can be LineString or MultiLineString.
        let flatCoords = [];
        if (route.geometry.type === 'MultiLineString') {
            route.geometry.coordinates.forEach(line => {
                line.forEach(coord => flatCoords.push([coord[1], coord[0]]));
            });
        } else if (route.geometry.type === 'LineString') {
            route.geometry.coordinates.forEach(coord => {
                flatCoords.push([coord[1], coord[0]]);
            });
        }

        return {
            distance: route.properties.distance,
            time: route.properties.time,
            coordinates: flatCoords, // Already [lat, lng] formatted!
            instructions: instructions
        };

    } catch (error) {
        console.error(
            "Route error:",
            error.response?.data || error.message
        );

        throw new Error("Unable to fetch route");
    }
};