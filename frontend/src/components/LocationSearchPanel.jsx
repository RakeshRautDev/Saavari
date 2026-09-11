import React from "react";

const LocationSearchPanel = ({
    setPannelOpen,
    setvechiclePannel,
    handleLocationSelect,
    suggestion,
    active,
    pickup,
    destination,
    pickupCoordinates,
    destinationCoordinates,findTrip, fetchRoute
}) => {
    const canFindTrip =
        pickup.trim() &&
        destination.trim() &&
        pickupCoordinates?.lat != null &&
        pickupCoordinates?.lng != null &&
        destinationCoordinates?.lat != null &&
        destinationCoordinates?.lng != null;

    return (
        <div>

            {/* Find Trip Button */}
            {canFindTrip && (
                <button
                    onClick={() => {
                        console.log("Pickup:", pickupCoordinates);
                        console.log("Destination:", destinationCoordinates);
                        findTrip();
                         fetchRoute();

                        setPannelOpen(false);
                        setvechiclePannel(true);

                    }}
                    className="w-full bg-black text-white py-3 rounded-lg font-medium mb-4"
                >
                    Find Trip
                </button>
            )}

            {/* Location Suggestions — fixed height so panel doesn't jump */}
            <div className="h-48 overflow-y-auto">
                {suggestion &&
                    suggestion.map((elem, index) => (
                        <div
                            key={index}
                            onClick={() => {
                                handleLocationSelect(elem);
                            }}
                            className="flex gap-4 border-2 p-3 rounded-xl border-gray-100 active:border-black items-center my-2 justify-start"
                        >
                            <h2 className="bg-[#eee] h-8 w-10 flex items-center justify-center rounded-full shrink-0">
                                <i className="ri-map-pin-fill"></i>
                            </h2>

                            <h4 className="font-medium min-w-0 break-words">
                                {elem.address.split(" - ")[0]}
                            </h4>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default LocationSearchPanel;