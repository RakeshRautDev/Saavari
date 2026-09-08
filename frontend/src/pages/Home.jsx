import React, { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import 'remixicon/fonts/remixicon.css'
import LocationSearchPanel from '../components/LocationSearchPanel'

const Home = () => {

  const [pickup, setPickup] = useState("")
  const [destination, setDestination] = useState("")
  const [pannelOpen, setPannelOpen] = useState(false)

  const panelRef = useRef(null)
  const pannelCloseRef = useRef(null)
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

  return (
    <div className='h-screen relative overflow-hidden'>

      <img
        className='w-16 absolute left-5 top-5'
        src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
        alt="Uber"
      />

      <div className='h-screen w-screen'>
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
          <LocationSearchPanel />
        </div>

      </div>


      <div className='fixed w-full z-10 bottom-0 px-3 py-6 bg-white'>
        <h3 className='text-2xl font-semibold mb-5'>Choose a Vechicle</h3>
        <div className='flex w-full p-3 mb-2 items-center justify-between border-2 border-black rounded-xl'>
          <img className="h-15" src="https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/v1.1/UberX_v1.png" alt="" />
          <div className='ml-2 w-1/2'>
            <h4 className='font-medium text-base'>UberGo <span><i className="ri-user-3-fill"></i>3</span></h4>
            <h5 className='font-medium text-sm'>3 mins away </h5>
            <p className='font-normal text-xs text-gray-600'>Affordable Auto rides</p>
          </div>
          <h2 className='text-lg font-semibold'>₹193.20</h2>
        </div>
         <div className='flex w-full p-3 mb-2 items-center justify-between border-2 border-black rounded-xl'>
          <img className="h-15" src="https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/v1.1/UberX_v1.png" alt="" />
          <div className='ml-2 w-1/2'>
            <h4 className='font-medium text-base'>UberGo <span><i className="ri-user-3-fill"></i>3</span></h4>
            <h5 className='font-medium text-sm'>3 mins away </h5>
            <p className='font-normal text-xs text-gray-600'>Affordable Auto rides</p>
          </div>
          <h2 className='text-lg font-semibold'>₹193.20</h2>
        </div>
         <div className='flex w-full p-3 mb-2 items-center justify-between border-2 border-black rounded-xl'>
          <img className="h-15" src="https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/v1.1/UberX_v1.png" alt="" />
          <div className='ml-2 w-1/2'>
            <h4 className='font-medium text-base'>UberGo <span><i className="ri-user-3-fill"></i>3</span></h4>
            <h5 className='font-medium text-sm'>3 mins away </h5>
            <p className='font-normal text-xs text-gray-600'>Affordable Auto rides</p>
          </div>
          <h2 className='text-lg font-semibold'>₹193.20</h2>
        </div>
        
      </div>
    </div>
  )
}

export default Home