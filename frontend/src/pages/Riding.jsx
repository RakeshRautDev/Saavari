import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { socketContextData } from './../context/SocketContext';
import LiveTracking from '../components/LiveTracking';
import RideChat from '../components/RideChat';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const Riding = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [rideData, setRideData] = React.useState(location.state?.ride || null);
    
    const extractLocation = (loc) => {
        if (!loc) return null;
        if (loc.coordinates) return { lat: loc.coordinates[1], lng: loc.coordinates[0] };
        if (loc.lat !== undefined) return loc;
        return null;
    };

    const [captainLocation, setCaptainLocation] = useState(() => extractLocation(rideData?.captain?.location));
    const [route, setRoute] = useState([]);
    const [destinationCoordinates, setDestinationCoordinates] = useState(null);
    const [distanceETA, setDistanceETA] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const chatPanelRef = React.useRef(null);

    useGSAP(() => {
        if (isChatOpen) {
            gsap.to(chatPanelRef.current, { transform: 'translateY(0)' });
            setUnreadCount(0);
        } else {
            gsap.to(chatPanelRef.current, { transform: 'translateY(100%)' });
        }
    }, [isChatOpen]);

    const { socket, receiveMessage } = useContext(socketContextData);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BASE_URL}/rides/user-current-ride`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('user-token')}` },
            withCredentials: true
        }).then(response => {
            if (response.data && response.data.status === 'ongoing') {
                setRideData(response.data);
                if (response.data.captain?.location) {
                    setCaptainLocation(extractLocation(response.data.captain.location));
                }
            } else {
                navigate('/home'); 
            }
        }).catch(err => {
            navigate('/home');
        });
    }, [navigate]);

    useEffect(() => {
        if (!socket) return;

        const cleanupEnded = receiveMessage("ride-ended", (ride) => {
            console.log("Ride ended:", ride);
            navigate("/home", { state: { rateRide: ride } });
        });

        const cleanupCancelled = receiveMessage("ride-cancelled", () => {
            console.log("Ride cancelled by captain");
            navigate("/home");
        });

        const cleanupLocation = receiveMessage("captain-location-update", (loc) => {
            setCaptainLocation(loc);
        });

        const cleanupChat = receiveMessage("receive-chat-message", (msg) => {
            if (!isChatOpen) {
                setUnreadCount(prev => prev + 1);
            }
        });

        return () => {
            cleanupEnded?.();
            cleanupCancelled?.();
            cleanupLocation?.();
            cleanupChat?.();
        };

    }, [socket, isChatOpen]);

    useEffect(() => {
        if (captainLocation && rideData?.destination) {
            // Fetch route
            axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-route`, {
                params: {
                    pickup: `${captainLocation.lat},${captainLocation.lng}`,
                    destination: rideData.destination
                },
                headers: { Authorization: `Bearer ${localStorage.getItem('user-token')}` },
                withCredentials: true
            }).then(res => {
                if (res.data && res.data.route) {
                    const leafletRoute = res.data.route.coordinates;
                    setRoute(leafletRoute);
                    setDistanceETA({
                        distance: res.data.route.distance,
                        time: res.data.route.time
                    });
                    if (leafletRoute.length > 0) {
                        setDestinationCoordinates({
                            lat: leafletRoute[leafletRoute.length - 1][0],
                            lng: leafletRoute[leafletRoute.length - 1][1]
                        });
                    }
                }
            }).catch(err => {
                console.error("Error fetching route for riding", err);
            });
        }
    }, [rideData?.destination, captainLocation?.lat, captainLocation?.lng]);

    return (
        <div className='h-screen overflow-hidden flex flex-col'>

            <Link
                to='/home'
                className='fixed right-2 top-2 h-10 w-10 bg-white flex items-center justify-center rounded-full z-10'
            >
                <i className="text-lg font-medium ri-home-5-line"></i>
            </Link>

            {/* Map */}
            <div className='h-1/2 relative'>
                <LiveTracking 
                    mapCenter={captainLocation ? [captainLocation.lat, captainLocation.lng] : undefined} 
                    route={route} 
                    captainLocation={captainLocation}
                    destinationLocation={destinationCoordinates}
                />
            </div>

            {/* Ride details */}
            <div className='h-1/2 p-4 overflow-hidden'>

                <div className='flex items-center justify-between'>
                    <img
                        className='h-16'
                        src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg"
                        alt=""
                    />

                    <div className='text-right'>
                        <h2 className='text-lg font-medium'>
                            {rideData?.captain?.fullname?.firstname + " " +
                             rideData?.captain?.fullname?.lastname}
                        </h2>

                        <h4 className='text-xl font-semibold -mt-1 -mb-1'>
                            {rideData?.captain?.vehicle?.plate}
                        </h4>

                        <p className='text-sm text-gray-600'>
                            {rideData?.captain?.vehicle?.vehicleType}
                        </p>
                    </div>
                </div>

                <div className='w-full mt-3'>

                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill"></i>

                        <div>
                            <h3 className='text-lg font-medium'>
                                {distanceETA ? `${(distanceETA.distance / 1000).toFixed(1)} KM • ${Math.ceil(distanceETA.time / 60)} mins` : 'Calculating...'}
                            </h3>

                            <p className='text-sm -mt-1 text-gray-600'>
                                {rideData?.destination?.split(",")[0]}
                            </p>
                        </div>
                    </div>

                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line"></i>

                        <div>
                            <h3 className='text-lg font-medium'>
                                ₹{rideData?.fare}
                            </h3>

                            <p className='text-sm -mt-1 text-gray-600'>
                                Cash Cash
                            </p>
                        </div>
                    </div>

                </div>

                <button className='w-full mt-3 bg-green-600 text-white font-semibold p-2 rounded-lg'>
                    Make A Payment
                </button>

            </div>

            <button 
                onClick={() => setIsChatOpen(true)}
                className='fixed right-4 bottom-4 h-14 w-14 bg-emerald-500 text-white rounded-full shadow-lg flex items-center justify-center z-[500] hover:bg-emerald-600 transition-colors'
            >
                <i className="ri-chat-3-fill text-2xl"></i>
                {unreadCount > 0 && (
                    <div className='absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white'>
                        {unreadCount}
                    </div>
                )}
            </button>

            <div ref={chatPanelRef} className='fixed bottom-0 left-0 w-full h-[80vh] z-[600] translate-y-full rounded-t-3xl overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.15)] bg-white'>
                <RideChat ride={rideData} currentUserType="user" onClose={() => setIsChatOpen(false)} />
            </div>

        </div>
    );
};

export default Riding;