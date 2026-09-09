import axios from "axios";

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
        const response = await axios.get(
            "https://api.geoapify.com/v1/routing",
            {
                params: {
                    waypoints: `${origin.lat},${origin.lng}|${destination.lat},${destination.lng}`,
                    mode: "drive",
                    apiKey: process.env.GEOAPIFY_API_KEY,
                },
            }
        );

        const route = response.data.features[0];

        const distance = route.properties.distance;
        const time = route.properties.time;

        return {
            distance: distance, // meters
            duration: time,     // seconds
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