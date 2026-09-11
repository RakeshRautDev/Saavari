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
import { useNavigate } from 'react-router-dom'

import LiveTracking from '../components/LiveTracking'

const Home = () => {

  const [pickup, setPickup] = useState("")
  const [destination, setDestination] = useState("")
  const [pannelOpen, setPannelOpen] = useState(false)
  const [vechiclePannel, setvechiclePannel] = useState(false)
  const [confirmRidePanel, setConfirmRidePanel] = useState(false)
  const [vehicleFound, setVehicleFound] = useState(false)
  const [waitingForDriver, setWaitingForDriver] = useState(false);
  const [location, setLocation] = useState([20.2724, 85.8339])


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



  const [mapCenter, setMapCenter] = useState(location);
  const [route, setRoute] = useState([]);
  const [captainLocation, setCaptainLocation] = useState(null);


  useEffect(() => {

    const fetchLocation = ()=>{
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log(pos.coords)
            setLocation([
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
          withCredentials: true
        });

        if (response.data) {
          const activeRide = response.data;
          setRideData(activeRide);

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
      setVehicleFound(false);
      setWaitingForDriver(true);
      setvechiclePannel(false);
    });

    const cleanupStarted = receiveMessage("ride-started", (ride) => {
      console.log("Ride started:", ride.rideId);

      navigate("/riding", { state: { ride: ride.ride } })

      setWaitingForDriver(false);
    });

    return () => {
      cleanupConfirmed?.();
      cleanupStarted?.();
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
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/get-fare`, {
        params: {
          pickup: pickup,
          destination: destination
        },
        withCredentials: true
      })
      setFare(res.data.fare);
      console.log(res)
    } catch (error) {

    }
  }

  const createRide = async (vehicleType) => {
    console.log("creating ride")
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/create`, { pickup, destination, vehicleType }, { withCredentials: true });
      console.log("Response", response);


    } catch (error) {

      console.log("Create ride error:", error.response?.data || error.message);

    }
  }

  const image = {
    car: "https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg",
    auto: "https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=672/height=672/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy9mYzEwMWZmOC04MWExLTQ2YzMtOTk1YS02N2I0YmJkMmYyYmYuanBn",
    motorcycle: "https://img.autocarpro.in/autocarpro/4d3ef0c9-c75e-46a3-af25-fab216e0bfe8_Untitled.jpg?w=750&h=490&q=75&c=1"
  }
  const submitHandler = (e) => {
    e.preventDefault()

    console.log(pickup, destination)
  }




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
    } else {
      gsap.to(waitingForDriverRef.current, { maxHeight: 0, duration: 0.4, ease: "power2.out" })
    }
  }, [waitingForDriver])

  useGSAP(() => {
    if (vechiclePannel || confirmRidePanel || vehicleFound || waitingForDriver) {
      gsap.to(searchFormRef.current, { maxHeight: 0, opacity: 0, duration: 0.4, ease: "power2.out" })
    } else {
      gsap.to(searchFormRef.current, { maxHeight: 500, opacity: 1, duration: 0.4, ease: "power2.out" })
    }
  }, [vechiclePannel, confirmRidePanel, vehicleFound, waitingForDriver])









  return (
    <div className='h-[100dvh] flex flex-col'>

      {/* Map section — grows/shrinks as bottom panels open */}
      <div className='flex-1 min-h-0 relative'>
        <img
          className='w-14 sm:w-16 absolute left-4 top-4 z-[500]'
          src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
          alt="Uber"
        />
        <LiveTracking location={location} mapCenter={mapCenter} route={route} captainLocation={captainLocation} 
        pickupLocation={pickupCoordinates}
        destinationLocation={destinationCoordinates}
        
        
        />
      </div>

      {/* Bottom section — all panels stack here in normal flow */}
      <div className='bg-white w-full shadow-[0_-4px_16px_rgba(0,0,0,0.1)]'>

        {/* Search form */}
        <div ref={searchFormRef} style={{ maxHeight: 500, overflow: 'hidden' }}>
          <div className='px-4 pt-4 pb-3 relative'>
            <h5
              ref={pannelCloseRef}
              onClick={() => setPannelOpen(false)}
              className='absolute opacity-0 right-5 top-4 text-2xl cursor-pointer z-10'
            >
              <i className="ri-arrow-down-wide-line"></i>
            </h5>

            <h4 className='text-2xl sm:text-3xl font-semibold mb-3'>Find a trip</h4>

            <form onSubmit={submitHandler}>
              <div className="relative">
                <div className="absolute left-5 top-[14px] bottom-[14px] w-[3px] bg-gray-800 rounded"></div>
                <input
                  className="bg-[#eee] px-12 py-2.5 text-sm sm:text-base rounded-lg w-full"
                  type="text"
                  placeholder="Enter your pick-up location"
                  value={pickup}
                  onChange={(e) => { setPickup(e.target.value); setActive("pickup"); }}
                  onClick={() => setPannelOpen(true)}
                />
                <input
                  className="bg-[#eee] px-12 py-2.5 text-sm sm:text-base rounded-lg w-full mt-3"
                  type="text"
                  placeholder="Enter your destination"
                  value={destination}
                  onChange={(e) => { setDestination(e.target.value); setActive("destination"); }}
                  onClick={() => setPannelOpen(true)}
                />
              </div>
            </form>
          </div>
        </div>

        {/* Location suggestions — expands in flow, map shrinks */}
        <div
          ref={panelRef}
          style={{ maxHeight: 0, overflow: 'hidden' }}
        >
          <div className="px-4 pb-4">
            <LocationSearchPanel
              setPannelOpen={setPannelOpen}
              setvechiclePannel={setvechiclePannel}
              handleLocationSelect={handleLocationSelect}
              suggestion={suggestion}
              active={active}
              pickup={pickup}
              destination={destination}
              pickupCoordinates={pickupCoordinates}
              destinationCoordinates={destinationCoordinates}
              findTrip={findTrip}
            />
          </div>
        </div>

        {/* Vehicle selection — expands in flow */}
        <div
          ref={vechiclePannelRef}
          style={{ maxHeight: 0, overflow: 'hidden' }}
        >
          <div className="px-3 pt-2 pb-6">
            <VehiclePanel
              setConfirmRidePanel={setConfirmRidePanel}
              setvechiclePannel={setvechiclePannel}
              setPannelOpen={setPannelOpen}
              fare={fare}
              SetSelectedVehicle={SetSelectedVehicle}
              createRide={createRide}
            />
          </div>
        </div>

        {/* Confirm ride — expands in flow */}
        <div
          ref={confirmRidePanelRef}
          style={{ maxHeight: 0, overflow: 'hidden' }}
        >
          <div className="px-3 pt-4 pb-8">
            <ConfirmRide
              setConfirmRidePanel={setConfirmRidePanel}
              setvechiclePannel={setvechiclePannel}
              setVehicleFound={setVehicleFound}
              pickup={pickup}
              destination={destination}
              selectedVehicle={selectedVehicle}
              fare={fare}
              image={image}
              createRide={createRide}
            />
          </div>
        </div>

        {/* Looking for driver — expands in flow */}
        <div
          ref={vehicleFoundRef}
          style={{ maxHeight: 0, overflow: 'hidden' }}
        >
          <div className="px-3 pt-4 pb-8">
            <LookingForDriver
              setConfirmRidePanel={setConfirmRidePanel}
              setvechiclePannel={setvechiclePannel}
              active={active}
              pickup={pickup}
              destination={destination}
              selectedVehicle={selectedVehicle}
              fare={fare}
              image={image}
              setVehicleFound={setVehicleFound}
              rideData={rideData}
            />
          </div>
        </div>

        {/* Waiting for driver — expands in flow */}
        <div
          ref={waitingForDriverRef}
          style={{ maxHeight: 0, overflow: 'hidden' }}
        >
          <div className="px-3 pt-4 pb-8">
            <WaitingForDriver
              waitingForDriver={waitingForDriver}
              rideData={rideData}
              setWaitingForDriver={setWaitingForDriver}
            />
          </div>
        </div>

      </div>
    </div>
  )
}

export default Home