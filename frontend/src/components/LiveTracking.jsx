import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap
} from 'react-leaflet';

import { useEffect } from 'react';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


// =====================================================
// Fix Leaflet default marker icon
// =====================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',

    iconUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',

    shadowUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


// =====================================================
// Move / center the map
// =====================================================

function MapUpdater({ center }) {

    const map = useMap();

    useEffect(() => {

        if (!center) return;

        map.flyTo(center, map.getZoom());

    }, [center, map]);

    return null;
}


// =====================================================
// Fit entire route inside the map
// =====================================================

function RouteFitter({ route }) {

    const map = useMap();

    useEffect(() => {

        if (!route || route.length === 0) return;

        map.fitBounds(route, {
            padding: [50, 50]
        });

    }, [route, map]);

    return null;
}


// =====================================================
// Handle map/container resize
// =====================================================

function ResizeHandler() {

    const map = useMap();

    useEffect(() => {

        const container = map.getContainer();

        const resizeObserver = new ResizeObserver(() => {

            map.invalidateSize();

        });

        resizeObserver.observe(container);

        return () => {

            resizeObserver.disconnect();

        };

    }, [map]);

    return null;
}


// =====================================================
// MAIN COMPONENT
// =====================================================

function LiveTracking({
    location,
    captainLocation = null,
    pickupLocation = null,
    destinationLocation = null,
    route = [],
    mapCenter = null,
    fitRoute = false
}) {

    // ---------------------------------------------
    // Don't create map until initial location exists
    // ---------------------------------------------

    if (!location) {

        return (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                Getting your location...
            </div>
        );

    }


    return (

        <div
            style={{
                height: '100%',
                width: '100%'
            }}
        >

            <MapContainer

                center={location}

                zoom={15}

                style={{
                    height: '100%',
                    width: '100%'
                }}

            >

                {/* ================================================= */}
                {/* MAP TILES */}
                {/* ================================================= */}

                <TileLayer

                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                    attribution="&copy; OpenStreetMap contributors"

                />


                {/* ================================================= */}
                {/* USER LOCATION */}
                {/* ================================================= */}

                {location && (

                    <Marker
                        position={location}
                    >

                        <Popup>
                            Your Location
                        </Popup>

                    </Marker>

                )}


                {/* ================================================= */}
                {/* CAPTAIN */}
                {/* ================================================= */}

                {captainLocation && (

                    <Marker
                        position={captainLocation}
                    >

                        <Popup>
                            Captain
                        </Popup>

                    </Marker>

                )}


                {/* ================================================= */}
                {/* PICKUP */}
                {/* ================================================= */}

                {pickupLocation && (

                    <Marker
                        position={pickupLocation}
                    >

                        <Popup>
                            Pickup Location
                        </Popup>

                    </Marker>

                )}


                {/* ================================================= */}
                {/* DESTINATION */}
                {/* ================================================= */}

                {destinationLocation && (

                    <Marker
                        position={destinationLocation}
                    >

                        <Popup>
                            Destination
                        </Popup>

                    </Marker>

                )}


                {/* ================================================= */}
                {/* ROUTE */}
                {/* ================================================= */}

                {route.length > 0 && (

                    <Polyline
                        positions={route}
                    />

                )}


                {/* ================================================= */}
                {/* MOVE MAP TO A SPECIFIC LOCATION */}
                {/* ================================================= */}

                {mapCenter && (

                    <MapUpdater
                        center={mapCenter}
                    />

                )}


                {/* ================================================= */}
                {/* FIT WHOLE ROUTE */}
                {/* ================================================= */}

                {fitRoute && route.length > 0 && (

                    <RouteFitter
                        route={route}
                    />

                )}


                {/* ================================================= */}
                {/* RESIZE HANDLER */}
                {/* ================================================= */}

                <ResizeHandler />

            </MapContainer>

        </div>

    );
}


export default LiveTracking;