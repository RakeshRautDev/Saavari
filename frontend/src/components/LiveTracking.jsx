import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Tooltip,
    useMap
} from 'react-leaflet';

import { useEffect, useRef, useMemo } from 'react';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


// =====================================================
// Fix Leaflet default marker icon (fallback, unused now
// but harmless to keep in case a plain Marker is added)
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
// Inline SVG / DivIcon builders — no external assets needed
// =====================================================

// Pulsing dot for "your location" — signals live tracking
function createUserIcon() {

    return L.divIcon({
        className: 'lt-user-icon',
        html: `
            <div class="lt-user-wrap">
                <div class="lt-user-pulse"></div>
                <div class="lt-user-dot"></div>
            </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
    });
}

// Simple colored pin (used for pickup / destination) built from inline SVG
function createPinIcon(color) {

    const svg = `
        <svg width="34" height="46" viewBox="0 0 34 46" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 0C7.6 0 0 7.6 0 17c0 12.5 17 29 17 29s17-16.5 17-29C34 7.6 26.4 0 17 0z"
                  fill="${color}" stroke="rgba(0,0,0,0.25)" stroke-width="1"/>
            <circle cx="17" cy="17" r="6.5" fill="white"/>
        </svg>
    `;

    return L.divIcon({
        className: 'lt-pin-icon',
        html: svg,
        iconSize: [34, 46],
        iconAnchor: [17, 46],
        popupAnchor: [0, -40],
    });
}

// Car icon that rotates to face travel direction
function createCaptainIcon(rotation = 0) {

    const svg = `
        <div class="lt-captain-wrap" style="transform: rotate(${rotation}deg)">
            <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="17" fill="#111827" stroke="white" stroke-width="2"/>
                <path d="M18 8 L25 24 L18 20 L11 24 Z" fill="#facc15"/>
            </svg>
        </div>
    `;

    return L.divIcon({
        className: 'lt-captain-icon',
        html: svg,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
    });
}


// =====================================================
// Bearing helper — angle from point A to point B in degrees
// =====================================================

function computeBearing([lat1, lon1], [lat2, lon2]) {

    const toRad = d => (d * Math.PI) / 180;
    const toDeg = r => (r * 180) / Math.PI;

    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x =
        Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
        Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);

    return (toDeg(Math.atan2(y, x)) + 360) % 360;
}


// =====================================================
// Move / center the map (smooth pan, reserve flyTo for first mount)
// =====================================================

function MapUpdater({ center }) {

    const map = useMap();
    const hasFlown = useRef(false);

    useEffect(() => {

        if (!center) return;

        if (!hasFlown.current) {

            map.flyTo(center, map.getZoom());
            hasFlown.current = true;

        } else {

            map.panTo(center, { animate: true, duration: 0.8 });

        }

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
// Polyline that progressively draws itself from start to
// end whenever the route changes, instead of appearing
// all at once
// =====================================================

function AnimatedRoute({ route, duration = 1200, pathOptions }) {

    const map = useMap();
    const layerRef = useRef(null);
    const rafRef = useRef(null);
    const routeKey = useRef('');

    useEffect(() => {

        if (!route || route.length < 2) return;

        // Only re-animate when the actual route changes, not on
        // every unrelated re-render
        const key = route.map(p => p.join(',')).join('|');

        if (key === routeKey.current) return;

        routeKey.current = key;

        // Remove any previous animated layer
        if (layerRef.current) {
            map.removeLayer(layerRef.current);
            layerRef.current = null;
        }

        if (rafRef.current) cancelAnimationFrame(rafRef.current);

        const line = L.polyline([route[0]], pathOptions).addTo(map);
        layerRef.current = line;

        const startTime = performance.now();
        const totalPoints = route.length;

        function step(now) {

            const t = Math.min((now - startTime) / duration, 1);
            const pointCount = Math.max(2, Math.round(t * totalPoints));

            line.setLatLngs(route.slice(0, pointCount));

            if (t < 1) {
                rafRef.current = requestAnimationFrame(step);
            }

        }

        rafRef.current = requestAnimationFrame(step);

        return () => {

            if (rafRef.current) cancelAnimationFrame(rafRef.current);

            if (layerRef.current) {
                map.removeLayer(layerRef.current);
                layerRef.current = null;
            }

        };

    }, [route, duration, map, pathOptions]);

    return null;
}


// =====================================================
// Marker that glides smoothly to a new position instead
// of snapping instantly (used for the captain marker)
// =====================================================

function AnimatedMarker({ position, icon, duration = 900, children }) {

    const markerRef = useRef(null);
    const prevPos = useRef(position);
    const rafRef = useRef(null);

    useEffect(() => {

        if (!markerRef.current) {
            prevPos.current = position;
            return;
        }

        const start = prevPos.current;
        const end = position;

        // Skip animating on first paint / identical positions
        if (!start || (start[0] === end[0] && start[1] === end[1])) {
            prevPos.current = end;
            return;
        }

        const startTime = performance.now();

        if (rafRef.current) cancelAnimationFrame(rafRef.current);

        function step(now) {

            const t = Math.min((now - startTime) / duration, 1);
            const lat = start[0] + (end[0] - start[0]) * t;
            const lng = start[1] + (end[1] - start[1]) * t;

            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            }

            if (t < 1) {
                rafRef.current = requestAnimationFrame(step);
            } else {
                prevPos.current = end;
            }

        }

        rafRef.current = requestAnimationFrame(step);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };

    }, [position, duration]);

    return (
        <Marker
            position={position}
            icon={icon}
            ref={markerRef}
        >
            {children}
        </Marker>
    );
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
    fitRoute = false,
    etaText = null
}) {

    // ---------------------------------------------
    // Track previous captain location to compute bearing
    // ---------------------------------------------

    const prevCaptainLocation = useRef(captainLocation);
    const captainRotation = useRef(0);

    if (captainLocation) {

        if (
            prevCaptainLocation.current &&
            (prevCaptainLocation.current[0] !== captainLocation[0] ||
                prevCaptainLocation.current[1] !== captainLocation[1])
        ) {

            captainRotation.current = computeBearing(
                prevCaptainLocation.current,
                captainLocation
            );

        }

        prevCaptainLocation.current = captainLocation;

    }

    // ---------------------------------------------
    // Memoized icons — rebuilt only when their inputs change
    // ---------------------------------------------

    const userIcon = useMemo(() => createUserIcon(), []);
    const pickupIcon = useMemo(() => createPinIcon('#22c55e'), []);
    const destinationIcon = useMemo(() => createPinIcon('#ef4444'), []);
    const captainIcon = useMemo(
        () => createCaptainIcon(captainRotation.current),
        [captainLocation]
    );

    // Midpoint of route for an ETA tooltip
    const routeMidpoint = useMemo(() => {

        if (!route || route.length === 0) return null;

        return route[Math.floor(route.length / 2)];

    }, [route]);


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

            {/* Inline styles for custom markers — kept scoped via class names */}
            <style>{`
                .lt-user-wrap {
                    position: relative;
                    width: 22px;
                    height: 22px;
                }
                .lt-user-dot {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 14px;
                    height: 14px;
                    background: #3b82f6;
                    border: 2px solid white;
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    box-shadow: 0 0 4px rgba(0,0,0,0.4);
                    z-index: 2;
                }
                .lt-user-pulse {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 14px;
                    height: 14px;
                    background: rgba(59, 130, 246, 0.5);
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    animation: lt-pulse 2s infinite;
                    z-index: 1;
                }
                @keyframes lt-pulse {
                    0% {
                        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.45);
                    }
                    70% {
                        box-shadow: 0 0 0 16px rgba(59, 130, 246, 0);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
                    }
                }
                .lt-captain-wrap {
                    transition: transform 0.3s ease;
                }
                .lt-eta-tooltip {
                    background: #111827;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 4px 8px;
                    font-size: 12px;
                    font-weight: 600;
                }
                .lt-eta-tooltip::before {
                    border-top-color: #111827;
                }
            `}</style>

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
                {/* USER LOCATION — pulsing live dot */}
                {/* ================================================= */}

                {location && (

                    <Marker
                        position={location}
                        icon={userIcon}
                    >

                        <Popup>
                            Your Location
                        </Popup>

                    </Marker>

                )}


                {/* ================================================= */}
                {/* CAPTAIN — rotating car icon, glides between updates */}
                {/* ================================================= */}

                {captainLocation && (

                    <AnimatedMarker
                        position={captainLocation}
                        icon={captainIcon}
                    >

                        <Popup>
                            Captain
                        </Popup>

                    </AnimatedMarker>

                )}


                {/* ================================================= */}
                {/* PICKUP — green pin */}
                {/* ================================================= */}

                {pickupLocation && (

                    <Marker
                        position={pickupLocation}
                        icon={pickupIcon}
                    >

                        <Popup>
                            Pickup Location
                        </Popup>

                    </Marker>

                )}


                {/* ================================================= */}
                {/* DESTINATION — red pin */}
                {/* ================================================= */}

                {destinationLocation && (

                    <Marker
                        position={destinationLocation}
                        icon={destinationIcon}
                    >

                        <Popup>
                            Destination
                        </Popup>

                    </Marker>

                )}


                {/* ================================================= */}
                {/* ROUTE — draws progressively from start to end */}
                {/* ================================================= */}

                {route.length > 1 && (

                    <AnimatedRoute
                        route={route}
                        duration={1200}
                        pathOptions={{
                            color: '#3b82f6',
                            weight: 4,
                            opacity: 0.85
                        }}
                    />

                )}


                {/* ================================================= */}
                {/* ETA LABEL — sits at route midpoint, if provided */}
                {/* ================================================= */}

                {routeMidpoint && etaText && (

                    <Marker
                        position={routeMidpoint}
                        icon={L.divIcon({ className: 'lt-eta-marker', html: '', iconSize: [0, 0] })}
                    >

                        <Tooltip
                            permanent
                            direction="top"
                            className="lt-eta-tooltip"
                        >
                            {etaText}
                        </Tooltip>

                    </Marker>

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