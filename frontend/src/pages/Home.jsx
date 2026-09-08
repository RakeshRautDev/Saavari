import React, { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import 'remixicon/fonts/remixicon.css'
import LocationSearchPanel from '../components/LocationSearchPanel'
import ConfirmRide from '../components/ConfirmedRide'
import VehiclePanel from '../components/VechiclePanel'
import LookingForDriver from '../components/LookingForDriver'
import WaitingForDriver from '../components/WaitingForDriver'
const Home = () => {

  const [pickup, setPickup] = useState("")
  const [destination, setDestination] = useState("")
  const [pannelOpen, setPannelOpen] = useState(false)
 const [vechiclePannel, setvechiclePannel] = useState(false)
  const [confirmRidePanel, setConfirmRidePanel] = useState(false)
  const [vehicleFound,setVehicleFound]=useState(false)
const [waitingForDriver,setWaitingForDriver]=useState(false);


  const panelRef = useRef(null)
  const pannelCloseRef = useRef(null)
  const vechiclePannelRef=useRef(null);
  const confirmRidePanelRef=useRef(null);
  const vehicleFoundRef=useRef(null);
  const waitingForDriverRef=useRef(null);


 



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




useGSAP(()=>{
  if(confirmRidePanel){
    gsap.to(confirmRidePanelRef.current,{
      transform:"translateY(0)"
    })
  } 
  else{
     gsap.to(confirmRidePanelRef.current,{
      transform:"translateY(100%)"
    })
  }
},[confirmRidePanel])


useGSAP(()=>{
  if(vechiclePannel){
    gsap.to(vechiclePannelRef.current,{
      transform:"translateY(0)"
    })
  }
  else{
     gsap.to(vechiclePannelRef.current,{
      transform:"translateY(100%)"
    })
  }
},[vechiclePannel])


useGSAP(()=>{
  if(vehicleFound){
    gsap.to(vehicleFoundRef.current,{
      transform:"translateY(0)"
    })
  }
  else{
     gsap.to(vehicleFoundRef.current,{
      transform:"translateY(100%)"
    })
  }
},[vehicleFound])

useGSAP(()=>{
  if(waitingForDriver){
    gsap.to(waitingForDriverRef.current,{
      transform:"translateY(0)"
    })
  }
  else{
     gsap.to(waitingForDriverRef.current,{
      transform:"translateY(100%)"
    })
  }
},[vehicleFound])


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
              onChange={(e) => setPickup(e.target.value)}
              onClick={() => setPannelOpen(true)}
            />

            <input
              className='bg-[#eee] px-12 py-2 text-base rounded-lg w-full mt-3'
              type="text"
              placeholder='Enter your destination'
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onClick={() => setPannelOpen(true)}
            />

          </form>

        </div>

        <div
          ref={panelRef}
          className={`h-0 ${pannelOpen ? "p-5" : "p-0"}  bg-white overflow-hidden`}
        >
          <LocationSearchPanel setPannelOpen={setPannelOpen} setvechiclePannel={setvechiclePannel} />
        </div>

      </div>


      <div ref={vechiclePannelRef} className="fixed w-full z-10 translate-y-full bottom-0 px-3 py-6 bg-white">
            <VehiclePanel setConfirmRidePanel={setConfirmRidePanel} setvechiclePannel={setvechiclePannel}></VehiclePanel>
      </div>

      <div ref={confirmRidePanelRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-14'>
        
        <ConfirmRide setConfirmRidePanel={setConfirmRidePanel} setvechiclePannel={setvechiclePannel} setVehicleFound={setVehicleFound}
         />
      </div>
      <div ref={vehicleFoundRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-14'>
        
        <LookingForDriver setConfirmRidePanel={setConfirmRidePanel} setvechiclePannel={setvechiclePannel} 
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