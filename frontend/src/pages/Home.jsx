import React, { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import 'remixicon/fonts/remixicon.css'
import LocationSearchPanel from '../components/LocationSearchPanel'
import ConfirmRide from '../components/ConfirmedRide'
import VehiclePanel from '../components/VechiclePanel'
import LookingForDriver from '../components/LookingForDriver'
import WaitingForDriver from '../components/WaitingForDriver'
import axios from "axios"
const Home = () => {

  const [pickup, setPickup] = useState("")
  const [destination, setDestination] = useState("")
  const [pannelOpen, setPannelOpen] = useState(false)
  const [vechiclePannel, setvechiclePannel] = useState(false)
  const [confirmRidePanel, setConfirmRidePanel] = useState(false)
  const [vehicleFound, setVehicleFound] = useState(false)
  const [waitingForDriver, setWaitingForDriver] = useState(false);

  const [active, setActive] = useState(null);
  const [suggestion, setSuggestion] = useState([])
  const [fare,setFare]=useState({});
  const [selectedVehicle,SetSelectedVehicle]=useState("");



  const panelRef = useRef(null)
  const pannelCloseRef = useRef(null)
  const vechiclePannelRef = useRef(null);
  const confirmRidePanelRef = useRef(null);
  const vehicleFoundRef = useRef(null);
  const waitingForDriverRef = useRef(null);

  const [pickupCoordinates, setPickupCoordinates] = useState(null);
const [destinationCoordinates, setDestinationCoordinates] = useState(null);

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
                    },withCredentials:true
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
    }

    if (active === "destination") {
        setDestination(elem.address);
        setDestinationCoordinates({
            lat: elem.lat,
            lng: elem.lng
        });
    }
  };


  const findTrip=async ()=>{

    if(!destinationCoordinates && !pickupCoordinates ){
      return 
    }
      try {
        const res=await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/get-fare`, {
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

  const image={
    car:"https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg",
    auto:"https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=672/height=672/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy9mYzEwMWZmOC04MWExLTQ2YzMtOTk1YS02N2I0YmJkMmYyYmYuanBn",
    motorcycle:"https://img.autocarpro.in/autocarpro/4d3ef0c9-c75e-46a3-af25-fab216e0bfe8_Untitled.jpg?w=750&h=490&q=75&c=1"
  }
  const submitHandler = (e) => {
    e.preventDefault()

    console.log(pickup, destination)
  }




  useGSAP(() => {
    if (pannelOpen) {
      gsap.to(panelRef.current, {
        height: "70%",
        duration: 0.5,
        ease: "power2.out"
      })
      gsap.to(pannelCloseRef.current, {
        opacity: 1
      })
    } else {
      gsap.to(panelRef.current, {
        height: "0%",
        duration: 0.5,
        ease: "power2.out"
      })
      gsap.to(pannelCloseRef.current, {
        opacity: 0
      })
    }
  }, [pannelOpen])




  useGSAP(() => {
    if (confirmRidePanel) {
      gsap.to(confirmRidePanelRef.current, {
        transform: "translateY(0)"
      })
    }
    else {
      gsap.to(confirmRidePanelRef.current, {
        transform: "translateY(100%)"
      })
    }
  }, [confirmRidePanel])


  useGSAP(() => {
    if (vechiclePannel) {
      gsap.to(vechiclePannelRef.current, {
        transform: "translateY(0)"
      })
    }
    else {
      gsap.to(vechiclePannelRef.current, {
        transform: "translateY(100%)"
      })
    }
  }, [vechiclePannel])


  useGSAP(() => {
    if (vehicleFound) {
      gsap.to(vehicleFoundRef.current, {
        transform: "translateY(0)"
      })
    }
    else {
      gsap.to(vehicleFoundRef.current, {
        transform: "translateY(100%)"
      })
    }
  }, [vehicleFound])

  useGSAP(() => {
    if (waitingForDriver) {
      gsap.to(waitingForDriverRef.current, {
        transform: "translateY(0)"
      })
    }
    else {
      gsap.to(waitingForDriverRef.current, {
        transform: "translateY(100%)"
      })
    }
  }, [vehicleFound])









  return (
    <div className='h-screen relative overflow-hidden'>

      <img
        className='w-16 absolute left-5 top-5'
        src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
        alt="Uber"
      />

      <div
        className='h-screen w-screen'>
        <img
          className='h-full w-full object-cover'
          src="https://miro.medium.com/v2/resize:fit:1100/format:webp/0*gwMx05pqII5hbfmX.gif"
          alt=""
        />
      </div>

      <div className='absolute top-0 w-full flex flex-col justify-end h-screen'>

        <div className='bg-white h-[30%] p-5 relative'>
          <h5 ref={pannelCloseRef} onClick={() => setPannelOpen(false)} className='absolute opacity-0 right-6 top-6 text-2xl'>
            <i className="ri-arrow-down-wide-line"></i>
          </h5>

          <h4 className='text-3xl font-semibold'>
            Find a trip
          </h4>

          <form onSubmit={submitHandler}>

            <div className="line absolute h-16 w-1 top-[45%] left-10 bg-gray-800 rounded">
            </div>

            <input
              className='bg-[#eee] px-12 py-2 text-base rounded-lg w-full mt-5'
              type="text"
              placeholder='Enter your pick-up location'
              value={pickup}
              onChange={(e) => {
                setPickup(e.target.value)
                setActive("pickup")
              }}
              onClick={() => setPannelOpen(true)}
            />

            <input
              className='bg-[#eee] px-12 py-2 text-base rounded-lg w-full mt-3'
              type="text"
              placeholder='Enter your destination'
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value)
                setActive("destination")
              }}
              onClick={() => setPannelOpen(true)}

            />

          </form>

        </div>

        <div
          ref={panelRef}
          className={`h-0 ${pannelOpen ? "p-5" : "p-0"}  bg-white overflow-hidden`}
        >
         <LocationSearchPanel
    setPannelOpen={setPannelOpen}
    setvechiclePannel={setvechiclePannel}
    handleLocationSelect={handleLocationSelect}
    suggestion={suggestion}
    active={active}
    pickup={pickup}
    destination={destination}
    pickupCoordinates={pickupCoordinates}
    destinationCoordinates={destinationCoordinates} findTrip={findTrip}
/>
        </div>

      </div>


      <div ref={vechiclePannelRef} className="fixed w-full z-10 translate-y-full bottom-0 px-3 py-6 bg-white">
        <VehiclePanel setConfirmRidePanel={setConfirmRidePanel} setvechiclePannel={setvechiclePannel} fare={fare} SetSelectedVehicle={SetSelectedVehicle}
        ></VehiclePanel>
      </div>

      <div ref={confirmRidePanelRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-14'>

        <ConfirmRide setConfirmRidePanel={setConfirmRidePanel} setvechiclePannel={setvechiclePannel} setVehicleFound={setVehicleFound} pickup={pickup} destination={destination} selectedVehicle={selectedVehicle} fare={fare} image={image} 
        />
      </div>
      <div ref={vehicleFoundRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-14'>

        <LookingForDriver setConfirmRidePanel={setConfirmRidePanel} setvechiclePannel={setvechiclePannel} active={active} pickup={pickup} destination={destination} selectedVehicle={selectedVehicle} fare={fare} image={image} 
        />
      </div>
      <div ref={waitingForDriverRef} className='fixed w-full z-10 bottom-0  bg-white px-3 py-10 pt-14'>

        <WaitingForDriver waitingForDriver={waitingForDriver}
        />
      </div>


    </div>
  )
}

export default Home