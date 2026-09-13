import React, { useContext, useEffect, useRef, useState } from 'react'
import { CaptainDataContext } from '../context/CaptainContext'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import CaptainDetails from './CaptainDetails';
import RidePopUp from '../components/RidePopUp';
import ConfirmRidePopUp from '../components/ConfirmRidePopUp';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { socketContextData } from '../context/SocketContext';
import axios from "axios"
import LiveTracking from '../components/LiveTracking';
import RatingPopUp from '../components/RatingPopUp';
import CaptainAIAssistant from '../components/CaptainAIAssistant';

const CaptainHome = () => {
  const {captain, setCaptain} = useContext(CaptainDataContext);
  const navigate = useNavigate();
  const routerLocation = useLocation();

  const[ridePopUpPanel,setRidePopUpPanel]=useState(false);
  const[confirmRidePopUpPanel,setConfirmRidePopUpPanel]=useState(false);

  const ridePopUpPanelRef=useRef(null);
  const confirmRidePopUpPanelRef=useRef(null);

  const {sendMessage, receiveMessage, socket} = useContext(socketContextData)

  const [ride, setRide] = useState(null);
  const [gpsLocation, setGpsLocation] = useState([20.2724, 85.8339]);
  const [activeTab, setActiveTab] = useState('ride');
  const [route, setRoute] = useState([]);
  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [distanceETA, setDistanceETA] = useState(null);
  const [rateRide, setRateRide] = useState(routerLocation.state?.rateRide || null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  const confirmRide = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/confirm`,{
        rideId:ride._id,
        captainId:captain._id,
      },{
        headers:{
          Authorization:`Bearer ${localStorage.getItem('captain-token')}`
        },
        withCredentials: true 
      })
      setRidePopUpPanel(false);
      setConfirmRidePopUpPanel(true);
    } catch (error) {
      console.log("Error confirming ride", error);
      setRidePopUpPanel(false);
      setRide(null);
    }
  }

  const cancelRide = async () => {
    if (!ride) return;
    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/cancel-captain`, {
        rideId: ride._id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('captain-token')}` },
        withCredentials: true
      });
      setRide(null);
      setRidePopUpPanel(false);
      setConfirmRidePopUpPanel(false);
      setRoute([]);
      setPickupCoordinates(null);
      setDistanceETA(null);
    } catch (error) {
      console.log("Error cancelling ride:", error);
    }
  };

  useEffect(() => {
    const checkCurrentRide = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/captain-current-ride`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('captain-token')}`
                },
                withCredentials: true
            });

            if (response.data) {
                const activeRide = response.data;
                setRide(activeRide); 

                if (activeRide.status === 'accepted') {
                    setConfirmRidePopUpPanel(true);
                } 
                else if (activeRide.status === 'ongoing') {
                    navigate('/captain-riding', { state: { ride: activeRide } });
                }
            }
        } catch (error) {
            console.error("No active ride or error:", error);
        }
    };

    checkCurrentRide();
  }, []);

  useEffect(()=>{
    if (!captain?._id){
      navigate("/captain-login");
      return;
    };

    if (!socket) return; 

    sendMessage("join",{userType:"captain",userId:captain._id})

    let watchId;
    
    if (captain.status === 'active' && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        position => {
          setGpsLocation([position.coords.latitude, position.coords.longitude]);
          sendMessage("update-location-captain", {
            userId: captain._id,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          });
        },
        error => {
          console.log("Error Getting Location:", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }

    return () => {
      if (watchId) {
         navigator.geolocation.clearWatch(watchId);
      }
    }
  }, [captain, socket]);

  useEffect(() => {
    const cleanupNewRide = receiveMessage("new-ride", async (data) => {
      setRide(data);
      setRidePopUpPanel(true);
      
      if (gpsLocation[0] && gpsLocation[1] && data.pickup) {
          setIsLoadingRoute(true);
          try {
              const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-distance-time`, {
                  params: {
                      origin: `${gpsLocation[0]},${gpsLocation[1]}`,
                      destination: data.pickup
                  },
                  headers: { Authorization: `Bearer ${localStorage.getItem('captain-token')}` },
                  withCredentials: true
              });
              if (res.data && res.data.result) {
                  setDistanceETA(res.data.result);
              }
          } catch (error) {
              console.error("Error fetching distance/time for popup", error);
          } finally {
              setIsLoadingRoute(false);
          }
      }
    });

    const cleanupCancelled = receiveMessage("ride-cancelled", (data) => {
      console.log("The passenger has cancelled the ride.");
      setRide(null);
      setRidePopUpPanel(false);
      setConfirmRidePopUpPanel(false);
      setRoute([]);
      setPickupCoordinates(null);
      setDistanceETA(null);
    });

    return () => {
       cleanupNewRide();
       cleanupCancelled();
    }
  }, [gpsLocation]);

  useGSAP(()=>{
    if(ridePopUpPanel){
      gsap.to(ridePopUpPanelRef.current,{ transform:"translateY(0)" })
    } else{
       gsap.to(ridePopUpPanelRef.current,{ transform:"translateY(100%)" })
    }
  },[ridePopUpPanel])

  useGSAP(()=>{
    if(confirmRidePopUpPanel){
      gsap.to(confirmRidePopUpPanelRef.current,{ transform:"translateY(0)" })
    } else if (ride && ride.status !== 'pending') {
       gsap.to(confirmRidePopUpPanelRef.current,{ transform:"translateY(calc(100% - 90px))" })
    } else {
       gsap.to(confirmRidePopUpPanelRef.current,{ transform:"translateY(100%)" })
    }
  },[confirmRidePopUpPanel, ride])

  const fetchRoute = async () => {
    if (!ride || !ride.pickup || !gpsLocation[0]) return;
    setIsLoadingRoute(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-route`, {
        params: {
          pickup: `${gpsLocation[0]},${gpsLocation[1]}`,
          destination: ride.pickup
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('captain-token')}` },
        withCredentials: true
      });
      if (res.data && res.data.route) {
        const leafletRoute = res.data.route.coordinates;
        setRoute(leafletRoute);
        if (leafletRoute.length > 0) {
            setPickupCoordinates({
                lat: leafletRoute[leafletRoute.length - 1][0],
                lng: leafletRoute[leafletRoute.length - 1][1]
            });
        }
      }
    } catch (error) {
      console.error("Error fetching route", error);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const toggleStatus = async () => {
    try {
      const newStatus = captain.status === 'active' ? 'inactive' : 'active';
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/status`,
        { status: newStatus },
        { 
          headers: { Authorization: `Bearer ${localStorage.getItem('captain-token')}` },
          withCredentials: true 
        }
      );
      setCaptain(response.data.captain);
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  return (
    <div className='h-[100dvh] flex flex-col bg-gray-50'>
      
      {/* Top Bar for Captain */}
      <div className='absolute p-4 top-0 flex items-center justify-between w-full z-[500] pointer-events-none'>
        <div className='flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-2 rounded-2xl shadow-md pointer-events-auto'>
          <div className='w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center'>
            <svg width='16' height='16' viewBox='0 0 22 22' fill='none'>
                <path d='M4 11L11 4L18 11' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
                <path d='M11 4V19' stroke='white' strokeWidth='2' strokeLinecap='round'/>
            </svg>
          </div>
          <span className='font-black text-[#0f172a] text-lg tracking-tight'>Sawari</span>
        </div>
        
        {/* Status Toggle UI */}
        <div 
            onClick={toggleStatus}
            className={`pointer-events-auto cursor-pointer flex items-center justify-center px-4 py-2.5 rounded-full shadow-lg font-bold text-sm transition-all duration-300 ${captain?.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
        >
            <div className={`w-2.5 h-2.5 rounded-full mr-2 shadow-sm ${captain?.status === 'active' ? 'bg-white' : 'bg-red-500'}`}></div>
            {captain?.status === 'active' ? 'Online' : 'Offline'}
        </div>
      </div>

      {rateRide && (
          <div className='fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center pointer-events-auto'>
              <RatingPopUp 
                  ride={rateRide} 
                  userType="captain" 
                  onClose={() => setRateRide(null)} 
              />
          </div>
      )}

      {/* Map Section */}
      <div className='flex-1 min-h-0 relative'>
        <LiveTracking 
            location={gpsLocation} 
            mapCenter={gpsLocation} 
            route={route} 
            captainLocation={{lat: gpsLocation[0], lng: gpsLocation[1]}}
            pickupLocation={pickupCoordinates}
        />
        {captain?.status !== 'active' && (
            <div className='absolute inset-0 bg-[#0f172a]/20 backdrop-blur-[2px] z-[400] flex items-center justify-center'>
                <div className='bg-white px-8 py-6 rounded-2xl shadow-2xl text-center max-w-[80%] border border-gray-100'>
                    <div className='w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <i className="ri-moon-fill text-3xl text-gray-400"></i>
                    </div>
                    <h3 className='text-xl font-bold text-[#0f172a]'>You are Offline</h3>
                    <p className='text-sm text-gray-500 mt-2 leading-relaxed'>Go online to start receiving ride requests and earning.</p>
                    <button onClick={toggleStatus} className='mt-5 bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold w-full hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30'>Go Online</button>
                </div>
            </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className='bg-white w-full shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-3xl z-10 flex flex-col relative shrink-0'>
        
        {/* Ride Dashboard */}
        <div style={{ display: activeTab === 'ride' ? 'block' : 'none' }}>
            {(!ride || ride.status === 'pending') && (
                <div className='p-6'>
                    <CaptainDetails />
                </div>
            )}

            <div ref={ridePopUpPanelRef} className="fixed w-full z-[600] translate-y-full bottom-[70px] left-0 rounded-t-3xl overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.15)] bg-white">
                <RidePopUp ride={ride} setRide={setRide} setRidePopUpPanel={setRidePopUpPanel} setConfirmRidePopUpPanel={setConfirmRidePopUpPanel} confirmRide={confirmRide} distanceETA={distanceETA} fetchRoute={fetchRoute} isLoadingRoute={isLoadingRoute} />
            </div>
            
            <div ref={confirmRidePopUpPanelRef} className="fixed w-full h-[calc(100dvh-120px)] z-[700] translate-y-full bottom-[70px] left-0 bg-white overflow-hidden rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)]">
                <ConfirmRidePopUp isPanelOpen={confirmRidePopUpPanel} setConfirmRidePopUpPanel={setConfirmRidePopUpPanel} setRidePopUpPanel={setRidePopUpPanel} ride={ride} setRide={setRide} distanceETA={distanceETA} cancelRide={cancelRide} />
            </div>
        </div>

        {/* AI Assistant Full Panel */}
        {activeTab === 'ai' && (
            <div className='h-[400px] w-full'>
                <CaptainAIAssistant />
            </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className='bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-[800]'>
        
        <button 
            onClick={() => setActiveTab('ride')} 
            className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'ride' ? 'text-emerald-500' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <i className={`text-2xl ${activeTab === 'ride' ? 'ri-dashboard-fill' : 'ri-dashboard-line'}`}></i>
            <span className='text-[10px] font-semibold'>Dashboard</span>
        </button>
        
        <button 
            onClick={() => setActiveTab('ai')} 
            className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'ai' ? 'text-emerald-500' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <i className={`text-2xl ${activeTab === 'ai' ? 'ri-robot-2-fill' : 'ri-robot-2-line'}`}></i>
            <span className='text-[10px] font-semibold'>Copilot</span>
        </button>

        <Link to='/captain/history' className='flex flex-col items-center gap-1 w-16 text-gray-400 hover:text-gray-600 transition-colors'>
            <i className='text-2xl ri-history-line'></i>
            <span className='text-[10px] font-semibold'>Earnings</span>
        </Link>

        <Link to='/captain/logout' className='flex flex-col items-center gap-1 w-16 text-gray-400 hover:text-red-500 transition-colors'>
            <i className='text-2xl ri-logout-circle-line'></i>
            <span className='text-[10px] font-semibold'>Logout</span>
        </Link>
      </div>

    </div>
  )
}

export default CaptainHome