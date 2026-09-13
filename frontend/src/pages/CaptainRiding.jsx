import React,{useRef, useState, useEffect, useContext} from 'react'
import { Link, useLocation } from 'react-router-dom'
import FinishRide from '../components/FinishRide'
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LiveTracking from '../components/LiveTracking';
import RideChat from '../components/RideChat';
import { socketContextData } from '../context/SocketContext';
import { CaptainDataContext } from '../context/CaptainContext';

const CaptainRiding = () => {

    const [finish, setfinish] = useState(false)
    const finishRidePanelRef = useRef(null)
    const location = useLocation();
    const navigate = useNavigate();
    const [instructions, setInstructions] = useState([]);
    
    const { sendMessage, receiveMessage, socket } = useContext(socketContextData);
    const { captain } = useContext(CaptainDataContext);

    // startRide returns { success, message, ride } — unwrap the ride object
    const [rideData, setRideData] = useState(location.state?.ride?.ride ?? location.state?.ride ?? null);

    const [currentLocation, setCurrentLocation] = useState(() => {
        if (rideData?.captain?.location?.coordinates) {
            return {
                lat: rideData.captain.location.coordinates[1],
                lng: rideData.captain.location.coordinates[0]
            };
        }
        if (rideData?.captain?.location?.lat) {
            return rideData.captain.location;
        }
        return null;
    });
    const [route, setRoute] = useState([]);
    const [destinationCoordinates, setDestinationCoordinates] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const chatPanelRef = useRef(null);

    useGSAP(() => {
        if (isChatOpen) {
            gsap.to(chatPanelRef.current, { transform: 'translateY(0)' });
            setUnreadCount(0);
        } else {
            gsap.to(chatPanelRef.current, { transform: 'translateY(100%)' });
        }
    }, [isChatOpen]);

    useEffect(() => {
        if (!socket) return;
        const cleanupChat = receiveMessage("receive-chat-message", (msg) => {
            if (!isChatOpen) {
                setUnreadCount(prev => prev + 1);
            }
        });
        return () => {
            cleanupChat?.();
        };
    }, [socket]);

    React.useEffect(() => {
        if (!rideData) {
            axios.get(`${import.meta.env.VITE_BASE_URL}/rides/captain-current-ride`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('captain-token')}` },
                withCredentials: true
            }).then(response => {
                if (response.data && response.data.status === 'ongoing') {
                    setRideData(response.data);
                } else {
                    navigate('/captain-home'); 
                }
            }).catch(err => {
                navigate('/captain-home');
            });
        }
    }, [rideData, navigate]);

    useEffect(() => {
        if (!captain?._id) return;

        const watchId = navigator.geolocation.watchPosition(
            position => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setCurrentLocation({ lat, lng });
                sendMessage("update-location-captain", {
                    userId: captain._id,
                    location: { lat, lng }
                });
            },
            error => {
                console.error("Error watching location:", error);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [captain]);

    useEffect(() => {
        if (currentLocation && rideData && rideData.destination) {
            axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-route`, {
                params: {
                    pickup: `${currentLocation.lat},${currentLocation.lng}`,
                    destination: rideData.destination
                },
                headers: { Authorization: `Bearer ${localStorage.getItem('captain-token')}` },
                withCredentials: true
            }).then(res => {
                if (res.data && res.data.route) {
                    const leafletRoute = res.data.route.coordinates;
                    setRoute(leafletRoute);
                    
                    if (res.data.route.instructions) {
                        setInstructions(res.data.route.instructions);
                    }

                    if (leafletRoute.length > 0) {
                        setDestinationCoordinates({
                            lat: leafletRoute[leafletRoute.length - 1][0],
                            lng: leafletRoute[leafletRoute.length - 1][1]
                        });
                    }
                }
            }).catch(err => {
                console.error("Failed to fetch route:", err);
            });
        }
    }, [rideData?.destination]); // only refetch if destination changes

    useGSAP(() => {
        if (finish) {
            gsap.to(finishRidePanelRef.current, {
                transform: "translateY(0)"
            })
        }
        else {
            gsap.to(finishRidePanelRef.current, {
                transform: "translateY(100%)"
            })
        }
    }, [finish])


    return (
        <div className='h-screen overflow-hidden relative flex flex-col'>

            <div className='fixed p-6 top-0 flex items-center justify-between w-screen z-10'>
                <img className='w-16' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
                <Link to='/captain-home' className=' h-10 w-10 bg-white flex items-center justify-center rounded-full'>
                    <i className="text-lg font-medium ri-logout-box-r-line"></i>
                </Link>
            </div>

            {/* Turn-by-turn instructions overlay */}
            {instructions && instructions.length > 0 && (
                <div className='absolute top-20 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-20 max-h-40 overflow-y-auto'>
                    <h3 className='font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide'>Directions</h3>
                    <ul className='space-y-2 text-sm text-gray-700'>
                        {instructions.map((inst, idx) => (
                            <li key={idx} className='flex gap-2 items-start'>
                                <i className="ri-corner-down-right-line text-blue-600"></i>
                                <span>{inst}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Map */}
            <div className='h-4/5 relative'>
                <LiveTracking 
                    mapCenter={currentLocation ? [currentLocation.lat, currentLocation.lng] : undefined}
                    route={route}
                    captainLocation={currentLocation}
                    destinationLocation={destinationCoordinates}
                />
            </div>

            {/* Ride details */}
            <div className="h-1/5 relative p-6 overflow-hidden bg-yellow-400 flex items-center justify-between" onClick={()=>{setfinish(true)}}>
                <h4 className="text-xl font-semibold">Drive to Destination</h4>
                <h5 className='p-1 z-10 text-center w-[95%] absolute top-0' onClick={() => {

                }}><i className="text-3xl text-gray-200 ri-arrow-up-wide-line"></i></h5>
                <button className="text-center bg-green-600 text-white font-semibold px-8 py-2 rounded-lg z-10 relative">
                    Complete Ride
                </button>
            </div>
            <div ref={finishRidePanelRef} className="fixed w-full h-screen z-30 translate-y-full bottom-0 px-3 py-6 bg-white">
                <FinishRide setfinish={setfinish} rideData={rideData}/>
            </div>

            <button 
                onClick={() => setIsChatOpen(true)}
                className='fixed left-4 bottom-28 h-14 w-14 bg-emerald-500 text-white rounded-full shadow-lg flex items-center justify-center z-[500] hover:bg-emerald-600 transition-colors'
            >
                <i className="ri-chat-3-fill text-2xl"></i>
                {unreadCount > 0 && (
                    <div className='absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white'>
                        {unreadCount}
                    </div>
                )}
            </button>

            <div ref={chatPanelRef} className='fixed bottom-0 left-0 w-full h-[80vh] z-[600] translate-y-full rounded-t-3xl overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.15)] bg-white'>
                <RideChat ride={rideData} currentUserType="captain" onClose={() => setIsChatOpen(false)} />
            </div>

        </div>
    )
}

export default CaptainRiding