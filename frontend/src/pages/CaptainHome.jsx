import React, { useContext, useEffect, useRef, useState } from 'react'
import { CaptainDataContext } from '../context/CaptainContext'
import { Link, useNavigate } from 'react-router-dom';
import CaptainDetails from './CaptainDetails';
import RidePopUp from '../components/RidePopUp';
import ConfirmRidePopUp from '../components/ConfirmRidePopUp';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { socketContextData } from '../context/SocketContext';
import axios from "axios"

const CaptainHome = () => {
  const {captain} = useContext(CaptainDataContext);
  

  const[ridePopUpPanel,setRidePopUpPanel]=useState(false);
  const[confirmRidePopUpPanel,setConfirmRidePopUpPanel]=useState(false);



  const ridePopUpPanelRef=useRef(null);
  const confirmRidePopUpPanelRef=useRef(null);

  const {sendMessage, receiveMessage, socket} = useContext(socketContextData)

  const [ride, setRide] = useState(null);

  const confirmRide = async () => {
    console.log("Confirming ride")
    try {
        const response = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/rides/confirm`,
            {
                rideId: ride._id,
                captainId: captain._id
            },{withCredentials:true}
        );

        console.log(response.data);

    } catch (error) {
        console.log(error);
    }
};

  useEffect(() => {
    const cleanup = receiveMessage("new-ride", (data) => {
      console.log("New ride received:", data);
      setRide(data);
      
      setRidePopUpPanel(true);
    });
    return cleanup;
  }, [socket]);

  const navigate = useNavigate();

  useEffect(()=>{
    if (!captain?._id){
      navigate("/captain-login");
      return;
    };

    if (!socket) return; // wait until socket is connected

    console.log("Emitting join for captain:", captain._id);
    sendMessage("join",{userType:"captain",userId:captain._id})

   const updateLocation=()=>{
    if(navigator.geolocation){
      console.log("Updating Location of captain")
      navigator.geolocation.getCurrentPosition(position=>{
        sendMessage("update-location-captain",{
        userId:captain._id,
        location:{
          lat:position.coords.latitude,
          lng:position.coords.longitude
        }
      })
    console.log("Updating Location",{
        userId:captain._id,
        lat:position.coords.latitude,
        lng:position.coords.longitude
      })
    }
    
    )
    }
    else{
      console.log("Error Getting Location");
    }
   }

const locationInterval = setInterval(updateLocation, 5000);
return () => {
        clearInterval(locationInterval);
    };

  },[socket])

   useGSAP(()=>{
  if(ridePopUpPanel){
    gsap.to(ridePopUpPanelRef.current,{
      transform:"translateY(0)"
    })
  } 
  else{
     gsap.to(ridePopUpPanelRef.current,{
      transform:"translateY(100%)"
    })
  }
},[ridePopUpPanel])

  useGSAP(()=>{
  if(confirmRidePopUpPanel){
    gsap.to(confirmRidePopUpPanelRef.current,{
      transform:"translateY(0)"
    })
  } 
  else{
     gsap.to(confirmRidePopUpPanelRef.current,{
      transform:"translateY(100%)"
    })
  }
},[confirmRidePopUpPanel])

  return (
    <div className='h-screen overflow-hidden'>
      <div className='fixed p-6 top-0 flex items-center justify-between w-screen'>
        <img className='w-16' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
        <Link to='/captain-home' className=' h-10 w-10 bg-white flex items-center justify-center rounded-full'>
          <i className="text-lg font-medium ri-logout-box-r-line"></i>
        </Link>
      </div>

      {/* Map */}
      <div className='h-3/5 '>
        <img
          className='h-full w-full object-cover'
          src="https://miro.medium.com/v2/resize:fit:1100/format:webp/0*gwMx05pqII5hbfmX.gif"
          alt=""
        />
      </div>

      {/* Ride details */}
      <div className='h-2/5 p-6 overflow-hidden'>

        <CaptainDetails />
       

      </div>
       <div ref={ridePopUpPanelRef} className="fixed w-full z-10 translate-y-full bottom-0 px-3 py-6 bg-white">
          <RidePopUp ride={ride} setRidePopUpPanel={setRidePopUpPanel} setConfirmRidePopUpPanel={setConfirmRidePopUpPanel}
          confirmRide={confirmRide}
          />
        </div>
       <div ref={confirmRidePopUpPanelRef} className="fixed w-full h-screen z-10 translate-y-full bottom-0 px-3 py-6 bg-white">
          <ConfirmRidePopUp setConfirmRidePopUpPanel={setConfirmRidePopUpPanel} setRidePopUpPanel={setRidePopUpPanel} ride={ride} />
        </div>
    </div>
  )
}

export default CaptainHome