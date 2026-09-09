import React, { useContext, useRef, useState } from 'react'
import { CaptainDataContext } from '../context/CaptainContext'
import { Link } from 'react-router-dom';
import CaptainDetails from './CaptainDetails';
import RidePopUp from '../components/RidePopUp';
import ConfirmRidePopUp from '../components/ConfirmRidePopUp';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const CaptainHome = () => {
  const data = useContext(CaptainDataContext);
  console.log(data);

  const[ridePopUpPanel,setRidePopUpPanel]=useState(true);
  const[confirmRidePopUpPanel,setConfirmRidePopUpPanel]=useState(false);



  const ridePopUpPanelRef=useRef(null);
  const confirmRidePopUpPanelRef=useRef(null);

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
          <RidePopUp setRidePopUpPanel={setRidePopUpPanel} setConfirmRidePopUpPanel={setConfirmRidePopUpPanel}/>
        </div>
       <div ref={confirmRidePopUpPanelRef} className="fixed w-full h-screen z-10 translate-y-full bottom-0 px-3 py-6 bg-white">
          <ConfirmRidePopUp setConfirmRidePopUpPanel={setConfirmRidePopUpPanel} setRidePopUpPanel={setRidePopUpPanel}/>
        </div>
    </div>
  )
}

export default CaptainHome