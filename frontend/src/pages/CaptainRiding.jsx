import React,{useRef, useState} from 'react'
import { Link, useLocation } from 'react-router-dom'
import FinishRide from '../components/FinishRide'
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useNavigate } from 'react-router-dom';
const CaptainRiding = () => {

    const [finish, setfinish] = useState(false)
    const finishRidePanelRef = useRef(null)
    const location = useLocation();
    const navigate = useNavigate();

    // startRide returns { success, message, ride } — unwrap the ride object
    const [rideData, setRideData] = useState(location.state?.ride?.ride ?? location.state?.ride ?? null);

    React.useEffect(() => {
        if (!rideData) {
            import('axios').then(axios => {
                axios.default.get(`${import.meta.env.VITE_BASE_URL}/rides/captain-current-ride`, {
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
            });
        }
    }, [rideData, navigate]);

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
        <div className='h-screen overflow-hidden'>


            <div className='fixed p-6 top-0 flex items-center justify-between w-screen'>
                <img className='w-16' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
                <Link to='/captain-home' className=' h-10 w-10 bg-white flex items-center justify-center rounded-full'>
                    <i className="text-lg font-medium ri-logout-box-r-line"></i>
                </Link>
            </div>

            {/* Map */}
            <div className='h-4/5 '>
                <img
                    className='h-full w-full object-cover'
                    src="https://miro.medium.com/v2/resize:fit:1100/format:webp/0*gwMx05pqII5hbfmX.gif"
                    alt=""
                />
            </div>

            {/* Ride details */}
            <div className="h-1/5 relative p-6 overflow-hidden bg-yellow-400 flex items-center justify-between" onClick={()=>{setfinish(true)}}>
                <h4 className="text-xl ">4KM away</h4>
                <h5 className='p-1 z-10 text-center w-[95%] absolute top-0' onClick={() => {

                }}><i className="text-3xl text-gray-200 ri-arrow-up-wide-line"></i></h5>
                <button className="text-center bg-green-600 text-white font-semibold px-8 py-2 rounded-lg">
                    Complete Ride
                </button>
            </div>
            <div ref={finishRidePanelRef} className="fixed w-full h-screen z-10 translate-y-full bottom-0 px-3 py-6 bg-white">
                <FinishRide setfinish={setfinish} rideData={rideData}/>
            </div>
        </div>
    )
}

export default CaptainRiding