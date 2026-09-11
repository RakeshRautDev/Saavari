import axios from "axios";
import { captainModel } from "../models/captain.model.js";

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
        const originCoordinates = await getAddressCoordinate(origin);
        const destinationCoordinates = await getAddressCoordinate(destination);

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

export const getCaptainsInTheRadius = async (lat, lng, radius) => {
    console.log("Captain Radius:", lat, lng, radius);

    // Use Haversine formula via $expr since location uses plain lat/lng numbers
    // (not GeoJSON), so $geoWithin/$centreSphere won't work here.
    const radiusInRadians = radius / 6371; // radius in km -> radians

    const captains = await captainModel.find({
        "location.lat": { $exists: true, $ne: null },
        "location.lng": { $exists: true, $ne: null },
        $expr: {
            $lte: [
                {
                    $acos: {
                        $add: [
                            {
                                $multiply: [
                                    { $sin: { $multiply: ["$location.lat", Math.PI / 180] } },
                                    { $sin: { $multiply: [lat, Math.PI / 180] } }
                                ]
                            },
                            {
                                $multiply: [
                                    { $cos: { $multiply: ["$location.lat", Math.PI / 180] } },
                                    { $cos: { $multiply: [lat, Math.PI / 180] } },
                                    { $cos: { $multiply: [{ $subtract: ["$location.lng", lng] }, Math.PI / 180] } }
                                ]
                            }
                        ]
                    }
                },
                radiusInRadians
            ]
        }
    });

    console.log("Captains nearby:", captains.length);
    return captains;
};


export const getRouteService = async (
    pickup,
    destination,
    vehicleType = null
) => {
    try {
        const getCoordinates = async (address) => {
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

        const route = response.data.features[0];

        return {
            distance: route.properties.distance,
            time: route.properties.time,
            coordinates: route.geometry.coordinates
        };

    } catch (error) {
        console.error(
            "Route error:",
            error.response?.data || error.message
        );

        throw new Error("Unable to fetch route");
    }
};