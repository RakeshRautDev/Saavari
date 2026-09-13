import React, { useContext, useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import 'remixicon/fonts/remixicon.css'
import LocationSearchPanel from '../components/LocationSearchPanel'
import ConfirmRide from '../components/ConfirmedRide'
import VehiclePanel from '../components/VechiclePanel'
import LookingForDriver from '../components/LookingForDriver'
import WaitingForDriver from '../components/WaitingForDriver'
import axios from "axios"
import { socketContextData } from '../context/SocketContext'
import { UserDataContext } from '../context/UserContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import LiveTracking from '../components/LiveTracking'
import RatingPopUp from '../components/RatingPopUp'

const Home = () => {

  const [pickup, setPickup] = useState("")
  const [destination, setDestination] = useState("")
  const [pannelOpen, setPannelOpen] = useState(false)
  const [vechiclePannel, setvechiclePannel] = useState(false)
  const [confirmRidePanel, setConfirmRidePanel] = useState(false)
  const [vehicleFound, setVehicleFound] = useState(false)
  const [waitingForDriver, setWaitingForDriver] = useState(false);
  const [gpsLocation, setGpsLocation] = useState([20.2724, 85.8339])


  const [active, setActive] = useState(null);
  const [suggestion, setSuggestion] = useState([])
  const [fare, setFare] = useState({});
  const [selectedVehicle, SetSelectedVehicle] = useState("");



  const panelRef = useRef(null)
  const pannelCloseRef = useRef(null)
  const vechiclePannelRef = useRef(null);
  const confirmRidePanelRef = useRef(null);
  const vehicleFoundRef = useRef(null);
  const waitingForDriverRef = useRef(null);
  const searchFormRef = useRef(null);

  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const { sendMessage, receiveMessage, socket } = useContext(socketContextData);
  const { user } = useContext(UserDataContext)

  const [rideData, setRideData] = useState(null);
  const navigate = useNavigate();
  const routerLocation = useLocation();

  const [mapCenter, setMapCenter] = useState(gpsLocation);
  const [route, setRoute] = useState([]);
  const [captainLocation, setCaptainLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('ride');
  const [isFetchingFares, setIsFetchingFares] = useState(false);
  const [isFetchingRoute, setIsFetchingRoute] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [captainETA, setCaptainETA] = useState(null);
  const [rateRide, setRateRide] = useState(routerLocation.state?.rateRide || null);


  useEffect(() => {

    const fetchLocation = ()=>{
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log(pos.coords)
            setGpsLocation([
              pos.coords.latitude,
              pos.coords.longitude
            ]);
          },
          (error) => {
            console.error("Geolocation error:", error);
          }
        );
      }
    }
    fetchLocation()

    const cleanup=setInterval(fetchLocation,5000);
    return clearInterval(cleanup)
  }, []);


  useEffect(() => {
    sendMessage("join", { userType: "user", userId: user._id })
  }, [])

  useEffect(() => {
    const checkCurrentRide = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/user-current-ride`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('user-token')}` },
          withCredentials: true
        });

        if (response.data) {
          const activeRide = response.data;
          setRideData(activeRide);

          if (activeRide.pickupCoords && activeRide.pickupCoords.coordinates) {
            setPickupCoordinates({
              lat: activeRide.pickupCoords.coordinates[1],
              lng: activeRide.pickupCoords.coordinates[0]
            });
          }
          if (activeRide.destinationCoords && activeRide.destinationCoords.coordinates) {
            setDestinationCoordinates({
              lat: activeRide.destinationCoords.coordinates[1],
              lng: activeRide.destinationCoords.coordinates[0]
            });
          }
          if (activeRide.captain && activeRide.captain.location && activeRide.captain.location.coordinates) {
            setCaptainLocation({
              lat: activeRide.captain.location.coordinates[1],
              lng: activeRide.captain.location.coordinates[0]
            });
            if (activeRide.status === 'accepted') {
              setMapCenter([activeRide.captain.location.coordinates[1], activeRide.captain.location.coordinates[0]]);
            }
          }

          if (activeRide.status === 'pending') {
            setVehicleFound(true);
          }
          else if (activeRide.status === 'accepted') {
            setWaitingForDriver(true);
          }
          else if (activeRide.status === 'ongoing') {
            navigate('/riding', { state: { ride: activeRide } });
          }
        }
      } catch (error) {
        console.error("No active ride or error:", error);
      }
    };

    checkCurrentRide();
  }, []);


  useEffect(() => {
    if (!socket) return;

    const cleanupConfirmed = receiveMessage("ride-confirmed", (ride) => {
      console.log("Ride confirmed:", ride);

      setRideData(ride);
      if (ride.pickupCoords && ride.pickupCoords.coordinates) {
        setPickupCoordinates({
          lat: ride.pickupCoords.coordinates[1],
          lng: ride.pickupCoords.coordinates[0]
        });
      }
      if (ride.captain && ride.captain.location && ride.captain.location.coordinates) {
        setCaptainLocation({
          lat: ride.captain.location.coordinates[1],
          lng: ride.captain.location.coordinates[0]
        });
        setMapCenter([ride.captain.location.coordinates[1], ride.captain.location.coordinates[0]]);
      }
      setVehicleFound(false);
      setWaitingForDriver(true);
      setvechiclePannel(false);
    });

    const cleanupStarted = receiveMessage("ride-started", (ride) => {
      console.log("Ride started:", ride.rideId);

      navigate("/riding", { state: { ride: ride.ride } })

      setWaitingForDriver(false);
    });

    const cleanupCancelled = receiveMessage("ride-cancelled", () => {
      console.log("Ride cancelled by captain");
      setRideData(null);
      setWaitingForDriver(false);
      setVehicleFound(false);
      setvechiclePannel(false);
      setPickupCoordinates(null);
      setDestinationCoordinates(null);
      setRoute([]);
      setCaptainLocation(null);
      setCaptainETA(null);
      setHasFetchedCaptainRoute(false);
    });

    const cleanupLocation = receiveMessage("captain-location-update", (loc) => {
      setCaptainLocation(loc);
      if (waitingForDriver) {
        setMapCenter([loc.lat, loc.lng]);
      }
    });

    return () => {
      cleanupConfirmed?.();
      cleanupStarted?.();
      cleanupCancelled?.();
      cleanupLocation?.();
    };

  }, [socket]);

  useEffect(() => {

    const fetchSuggestion = async () => {

      let value = "";

      if (active === "pickup") {
        value = pickup;
      }
      else if (active === "destination") {
        value = destination;
      }

      if (value.length < 3) {
        setSuggestion([]);
        return;
      }

      try {

        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
          {
            params: {
              input: value
            }, withCredentials: true
          },

        );

        console.log(res.data);

        setSuggestion(res.data.suggestions);

      } catch (error) {

        console.log(error);
        console.log(error.response);

      }
    };

    const timer = setTimeout(() => {
      fetchSuggestion();
    }, 300);

    return () => clearTimeout(timer);

  }, [pickup, destination, active]);


  const handleLocationSelect = (elem) => {
    if (active === "pickup") {
      setPickup(elem.address);
      setPickupCoordinates({
        lat: elem.lat,
        lng: elem.lng
      });
      setMapCenter([elem.lat,elem.lng])


    }

    if (active === "destination") {
      setDestination(elem.address);
      setDestinationCoordinates({
        lat: elem.lat,
        lng: elem.lng
      });
      setMapCenter([elem.lat,elem.lng])
    }
  };


  const findTrip = async () => {
    if (!destinationCoordinates && !pickupCoordinates) {
      return
    }
    setIsFetchingFares(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/get-fare`, {
        params: {
          pickup: pickup,
          destination: destination
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('user-token')}`
        },
        withCredentials: true
      })
      setFare(res.data.fare);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingFares(false);
    }
  }

  const createRide = async (vehicleType) => {
    console.log("creating ride")
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/create`, { pickup, destination, vehicleType }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('user-token')}`
        },
        withCredentials: true 
      });
      console.log("Response", response);
      if (response.data && response.data.ride) {
        setRideData(response.data.ride);
      }

    } catch (error) {

      console.log("Create ride error:", error.response?.data || error.message);

    }
  }

  const cancelRide = async () => {
    if (!rideData) return;
    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/cancel-user`, {
        rideId: rideData._id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('user-token')}` },
        withCredentials: true
      });
      setRideData(null);
      setVehicleFound(false);
      setWaitingForDriver(false);
      setPannelOpen(false);
    } catch (error) {
      console.error("Error cancelling ride:", error.response?.data || error.message);
    }
  };

  const image = {
    car: "https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg",
    auto: "https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=672/height=672/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy9mYzEwMWZmOC04MWExLTQ2YzMtOTk1YS02N2I0YmJkMmYyYmYuanBn",
    motorcycle: "https://img.autocarpro.in/autocarpro/4d3ef0c9-c75e-46a3-af25-fab216e0bfe8_Untitled.jpg?w=750&h=490&q=75&c=1"
  }
  const submitHandler = (e) => {
    e.preventDefault()

    console.log(pickup, destination)
  }


  // Fetch route and ETA from Captain to Pickup (called once when driver is accepted)
  const [hasFetchedCaptainRoute, setHasFetchedCaptainRoute] = useState(false);

  useEffect(() => {
    if (waitingForDriver && captainLocation && pickupCoordinates && !hasFetchedCaptainRoute) {
      const fetchCaptainETA = async () => {
        setHasFetchedCaptainRoute(true);
        try {
          // Fetch the route points for the map
          const routeRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-route`, {
            params: {
              pickup: `${captainLocation.lat},${captainLocation.lng}`,
              destination: `${pickupCoordinates.lat},${pickupCoordinates.lng}`
            },
            headers: { Authorization: `Bearer ${localStorage.getItem('user-token')}` },
            withCredentials: true
          });
          if (routeRes.data?.route?.coordinates) {
            setRoute(routeRes.data.route.coordinates);
          }

          // Fetch the ETA values
          const etaRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-distance-time`, {
            params: {
              origin: `${captainLocation.lat},${captainLocation.lng}`,
              destination: `${pickupCoordinates.lat},${pickupCoordinates.lng}`
            },
            headers: { Authorization: `Bearer ${localStorage.getItem('user-token')}` },
            withCredentials: true
          });
          if (etaRes.data?.distance && etaRes.data?.duration) {
            setCaptainETA({
              distance: etaRes.data.distance.value,
              time: etaRes.data.duration.value
            });
          }
        } catch (error) {
          console.error("Error fetching captain route:", error);
        }
      };
      fetchCaptainETA();
    }
  }, [waitingForDriver, captainLocation, pickupCoordinates, hasFetchedCaptainRoute]);

  const fetchRoute = async () => {
    try {
      console.log("Fetching Route");
      console.log("Pickup:", pickupCoordinates);
      console.log("Destination:", destinationCoordinates);

      if (!pickupCoordinates || !destinationCoordinates) {
        return;
      }
      setIsFetchingRoute(true);

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/get-route`,
        {
          params: {
            pickup: `${pickupCoordinates.lat},${pickupCoordinates.lng}`,
            destination: `${destinationCoordinates.lat},${destinationCoordinates.lng}`,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('user-token')}`
          },
          withCredentials: true
        }
      );

      console.log("Route:", response.data);
      if (response.data && response.data.route) {
        const leafletRoute = response.data.route.coordinates;
        console.log("Leaflet Route:", leafletRoute);
        setRoute(leafletRoute);
      }
    } catch (error) {
      console.error("Error fetching route", error);
    } finally {
      setIsFetchingRoute(false);
    }
  };


  useGSAP(() => {
    if (pannelOpen) {
      gsap.to(panelRef.current, { maxHeight: 700, duration: 0.4, ease: "power2.out" })
      gsap.to(pannelCloseRef.current, { opacity: 1, duration: 0.2 })
    } else {
      gsap.to(panelRef.current, { maxHeight: 0, duration: 0.4, ease: "power2.out" })
      gsap.to(pannelCloseRef.current, { opacity: 0, duration: 0.2 })
    }
  }, [pannelOpen])

  useGSAP(() => {
    if (confirmRidePanel) {
      gsap.to(confirmRidePanelRef.current, { maxHeight: 700, duration: 0.4, ease: "power2.out" })
    } else {
      gsap.to(confirmRidePanelRef.current, { maxHeight: 0, duration: 0.4, ease: "power2.out" })
    }
  }, [confirmRidePanel])

  useGSAP(() => {
    if (vechiclePannel) {
      gsap.to(vechiclePannelRef.current, { maxHeight: 700, duration: 0.4, ease: "power2.out" })
    } else {
      gsap.to(vechiclePannelRef.current, { maxHeight: 0, duration: 0.4, ease: "power2.out" })
    }
  }, [vechiclePannel])

  useGSAP(() => {
    if (vehicleFound) {
      gsap.to(vehicleFoundRef.current, { maxHeight: 700, duration: 0.4, ease: "power2.out" })
    } else {
      gsap.to(vehicleFoundRef.current, { maxHeight: 0, duration: 0.4, ease: "power2.out" })
    }
  }, [vehicleFound])

  useGSAP(() => {
    if (waitingForDriver) {
      gsap.to(waitingForDriverRef.current, { maxHeight: 700, duration: 0.4, ease: "power2.out" })
    } else if (rideData && rideData.status === 'accepted') {
      gsap.to(waitingForDriverRef.current, { maxHeight: 90, duration: 0.4, ease: "power2.out" })
    } else {
      gsap.to(waitingForDriverRef.current, { maxHeight: 0, duration: 0.4, ease: "power2.out" })
    }
  }, [waitingForDriver, rideData])

  useGSAP(() => {
    if (vechiclePannel || confirmRidePanel || vehicleFound || waitingForDriver || rideData) {
      gsap.to(searchFormRef.current, { maxHeight: 0, opacity: 0, duration: 0.4, ease: "power2.out" })
    } else {
      gsap.to(searchFormRef.current, { maxHeight: 500, opacity: 1, duration: 0.4, ease: "power2.out" })
    }
  }, [vechiclePannel, confirmRidePanel, vehicleFound, waitingForDriver, rideData])









    return (
    <div className='h-[100dvh] flex flex-col bg-gray-50'>
      
      {/* Top Bar */}
      <div className='absolute p-4 top-0 flex items-center justify-between w-full z-[500] pointer-events-none'>
        <div className='flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-2 rounded-2xl shadow-md pointer-events-auto'>
          <div className='w-7 h-7 rounded-lg bg-[#0f172a] flex items-center justify-center'>
            <svg width='16' height='16' viewBox='0 0 22 22' fill='none'>
                <path d='M4 11L11 4L18 11' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/>
                <path d='M11 4V19' stroke='white' strokeWidth='2' strokeLinecap='round'/>
            </svg>
          </div>
          <span className='font-black text-[#0f172a] text-lg tracking-tight'>Sawari</span>
        </div>
        
        <div className='flex items-center gap-2 pointer-events-auto'>
            <button className='w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md text-[#0f172a] hover:bg-gray-50 transition-colors'>
                <i className="ri-notification-3-line text-lg"></i>
            </button>
        </div>
      </div>

      {rateRide && (
          <div className='fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center pointer-events-auto'>
              <RatingPopUp 
                  ride={rateRide} 
                  userType="user" 
                  onClose={() => setRateRide(null)} 
              />
          </div>
      )}

      {/* Map Section */}
      <div className='flex-1 min-h-0 relative'>
        <LiveTracking location={gpsLocation} mapCenter={mapCenter} route={route} captainLocation={captainLocation} 
          pickupLocation={pickupCoordinates} destinationLocation={destinationCoordinates}
        />
        
        {/* Quick actions over map */}
        <div className='absolute right-4 bottom-6 z-[400] flex flex-col gap-3 pointer-events-auto'>
            <button 
                onClick={async () => {
                  if (navigator.geolocation) {
                    setIsFetchingLocation(true);
                    navigator.geolocation.getCurrentPosition(
                      async (pos) => {
                        const lat = pos.coords.latitude;
                        const lng = pos.coords.longitude;
                        try {
                          const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-address?lat=${lat}&lng=${lng}`, { 
                            headers: { Authorization: `Bearer ${localStorage.getItem('user-token')}` },
                            withCredentials: true 
                          });
                          if (res.data.address) {
                            setPickup(res.data.address);
                            setPickupCoordinates({ lat, lng });
                            setMapCenter([lat, lng]);
                            setActive("destination");
                          }
                        } catch (error) {
                          console.error("Error fetching address:", error);
                        } finally {
                          setIsFetchingLocation(false);
                        }
                      },
                      (error) => {
                        console.error("Geolocation error:", error);
                        setIsFetchingLocation(false);
                      }
                    );
                  }
                }}
                className='w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-[#0f172a] hover:bg-gray-50 transition-colors'
            >
                {isFetchingLocation ? <i className="ri-loader-4-line text-lg animate-spin"></i> : <i className="ri-focus-3-line text-lg"></i>}
            </button>
        </div>
      </div>

     
      <div className='bg-white w-full shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-3xl z-10 flex flex-col relative shrink-0'>
        
      
        <div style={{ display: activeTab === 'ride' ? 'block' : 'none' }}>
            
           
            {(isFetchingFares || isFetchingRoute) && (
              <div className='absolute inset-0 bg-white/80 backdrop-blur-sm z-[200] flex flex-col items-center justify-center rounded-t-3xl'>
                  <div className='w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4'></div>
                  <p className='text-[#0f172a] font-semibold animate-pulse'>Finding best routes & fares...</p>
              </div>
            )}

            {/* Search form */}
            <div ref={searchFormRef} style={{ maxHeight: 500, overflow: 'hidden' }}>
              <div className='px-6 pt-6 pb-4 relative'>
                <h5 ref={pannelCloseRef} onClick={() => setPannelOpen(false)} className='absolute opacity-0 right-6 top-6 text-2xl cursor-pointer z-10 text-gray-400 hover:text-[#0f172a] transition-colors'>
                  <i className="ri-arrow-down-s-line"></i>
                </h5>
                <h4 className='text-2xl font-bold text-[#0f172a] mb-5 tracking-tight'>Where to?</h4>
                <form onSubmit={submitHandler} className='space-y-3 relative'>
                  <div className="absolute left-[22px] top-[24px] bottom-[24px] w-0.5 bg-gray-200 z-10"></div>
                  
                  <div className='relative flex items-center'>
                      <div className='absolute left-4 w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.2)] z-20'></div>
                      <input className="bg-gray-50 border border-gray-100 px-12 py-3.5 text-[15px] font-medium text-[#0f172a] rounded-2xl w-full focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400 outline-none" type="text" placeholder="Current location" value={pickup} onChange={(e) => { setPickup(e.target.value); setActive("pickup"); }} onClick={() => setPannelOpen(true)} />
                  </div>
                  
                  <div className='relative flex items-center'>
                      <div className='absolute left-4 w-3 h-3 rounded-sm bg-[#0f172a] z-20'></div>
                      <input className="bg-gray-50 border border-gray-100 px-12 py-3.5 text-[15px] font-medium text-[#0f172a] rounded-2xl w-full focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400 outline-none" type="text" placeholder="Enter destination" value={destination} onChange={(e) => { setDestination(e.target.value); setActive("destination"); }} onClick={() => setPannelOpen(true)} />
                  </div>
                </form>
              </div>
            </div>

          
            <div ref={panelRef} style={{ maxHeight: 0, overflow: 'hidden' }}>
              <div className="px-4 pb-4 border-t border-gray-100">
                <LocationSearchPanel setPannelOpen={setPannelOpen} setvechiclePannel={setvechiclePannel} handleLocationSelect={handleLocationSelect} suggestion={suggestion} active={active} pickup={pickup} destination={destination} pickupCoordinates={pickupCoordinates} destinationCoordinates={destinationCoordinates} findTrip={findTrip} fetchRoute={fetchRoute} />
              </div>
            </div>

            <div ref={vechiclePannelRef} style={{ maxHeight: 0, overflow: 'hidden' }}>
              <div className="px-4 pt-2 pb-6">
                <VehiclePanel setConfirmRidePanel={setConfirmRidePanel} setvechiclePannel={setvechiclePannel} setPannelOpen={setPannelOpen} fare={fare} SetSelectedVehicle={SetSelectedVehicle} createRide={createRide} />
              </div>
            </div>

         
            <div ref={confirmRidePanelRef} style={{ maxHeight: 0, overflow: 'hidden' }}>
              <div className="px-4 pt-4 pb-8">
                <ConfirmRide setConfirmRidePanel={setConfirmRidePanel} setvechiclePannel={setvechiclePannel} setVehicleFound={setVehicleFound} pickup={pickup} destination={destination} selectedVehicle={selectedVehicle} fare={fare} image={image} createRide={createRide} />
              </div>
            </div>

         
            <div ref={vehicleFoundRef} style={{ maxHeight: 0, overflow: 'hidden' }}>
              <div className="px-4 pt-4 pb-8">
                <LookingForDriver cancelRide={cancelRide} setConfirmRidePanel={setConfirmRidePanel} setvechiclePannel={setvechiclePannel} active={active} pickup={pickup} destination={destination} selectedVehicle={selectedVehicle} fare={fare} image={image} setVehicleFound={setVehicleFound} rideData={rideData} />
              </div>
            </div>

           
            <div ref={waitingForDriverRef} style={{ maxHeight: 0, overflow: 'hidden' }}>
              <div className="px-4 pt-4 pb-8">
                <WaitingForDriver waitingForDriver={waitingForDriver} rideData={rideData} setWaitingForDriver={setWaitingForDriver} captainETA={captainETA} cancelRide={cancelRide} />
              </div>
            </div>
        </div>

      
        {activeTab === 'ai' && (
            <div className='h-[400px] w-full'>
                <AIAssistant />
            </div>
        )}
      </div>

   
      <div className='bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-[800]'>
        
        <button 
            onClick={() => setActiveTab('ride')} 
            className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'ride' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <i className={`text-2xl ${activeTab === 'ride' ? 'ri-car-fill' : 'ri-car-line'}`}></i>
            <span className='text-[10px] font-semibold'>Ride</span>
        </button>
        
        <button 
            onClick={() => setActiveTab('ai')} 
            className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'ai' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <i className={`text-2xl ${activeTab === 'ai' ? 'ri-robot-2-fill' : 'ri-robot-2-line'}`}></i>
            <span className='text-[10px] font-semibold'>Ask AI</span>
        </button>

        <Link to='/user/history' className='flex flex-col items-center gap-1 w-16 text-gray-400 hover:text-gray-600 transition-colors'>
            <i className='text-2xl ri-history-line'></i>
            <span className='text-[10px] font-semibold'>History</span>
        </Link>

        <Link to='/user/profile' className='flex flex-col items-center gap-1 w-16 text-gray-400 hover:text-gray-600 transition-colors'>
            <i className='text-2xl ri-user-3-line'></i>
            <span className='text-[10px] font-semibold'>Profile</span>
        </Link>
      </div>

    </div>
  )
}

export default Home