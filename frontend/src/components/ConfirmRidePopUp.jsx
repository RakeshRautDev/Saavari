import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from "axios"
const ConfirmRidePopUp = (props) => {

    const [otp,setOtp]=useState("");
    const [loading, setLoading] = useState(false);
    const navigate=useNavigate();

   const submitHandler = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
        const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/rides/start-ride`,
            {
                params: {
                    rideId: props.ride?._id,
                    otp
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('captain-token')}`
                },
                withCredentials: true
            }
        );

        console.log("Ride started:", response.data);
        props.setRidePopUpPanel(false)
        props.setConfirmRidePopUpPanel(false);
        console.log("Moving to riding", props.ride)
        navigate("/captain-riding", {state: {ride: response.data}});

    } catch (error) {
        console.error(
            "Error starting ride:",
            error.response?.data || error.message
        );
        setLoading(false);
    }
};
    return (
        <div className="h-full bg-white relative flex flex-col">
            <div 
                className="pt-3 pb-4 px-4 bg-white cursor-pointer border-b border-gray-100 flex-shrink-0"
                onClick={() => props.setConfirmRidePopUpPanel(!props.isPanelOpen)}
            >
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3"></div>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className='text-lg font-bold text-[#0f172a]'>Active Ride</h3>
                        <p className='text-xs font-semibold text-emerald-600'>SWIPE OR CLICK TO EXPAND</p>
                    </div>
                    <div className='text-right'>
                        <h5 className='text-lg font-black text-emerald-600'>
                            {props.distanceETA ? `${(props.distanceETA.distance / 1000).toFixed(1)} km` : <i className="ri-loader-4-line animate-spin inline-block"></i>}
                        </h5>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
                <div className='flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm'>
                    <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600'>
                            <i className="ri-user-fill text-2xl"></i>
                        </div>
                        <h2 className='text-xl font-bold text-[#0f172a]'>
                            {props.ride?.user?.firstname
                                ? props.ride.user.firstname + " " + (props.ride.user.lastname || "")
                                : "Passenger"}
                        </h2>
                    </div>
                </div>

                <div className='w-full mt-6 bg-gray-50 rounded-2xl p-2 border border-gray-100'>
                    <div className='flex items-start gap-4 p-3 border-b border-gray-200'>
                        <div className='w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1'>
                            <div className='w-2 h-2 rounded-full bg-blue-600'></div>
                        </div>
                        <div className='flex-1 min-w-0'>
                            <h3 className='text-[17px] font-bold text-[#0f172a] truncate'>{props.ride?.pickup?.split(",")[0]}</h3>
                            <p className='text-sm text-gray-500 line-clamp-2 leading-snug mt-0.5'>{props.ride?.pickup?.split(",").slice(1).join(",")}</p>
                        </div>
                    </div>
                    
                    <div className='flex items-start gap-4 p-3 border-b border-gray-200'>
                        <div className='w-6 h-6 flex items-center justify-center shrink-0 mt-1'>
                            <i className="text-xl text-red-500 ri-map-pin-2-fill"></i>
                        </div>
                        <div className='flex-1 min-w-0'>
                            <h3 className='text-[17px] font-bold text-[#0f172a] truncate'>{props.ride?.destination?.split(",")[0]}</h3>
                            <p className='text-sm text-gray-500 line-clamp-2 leading-snug mt-0.5'>{props.ride?.destination?.split(",").slice(1).join(",")}</p>
                        </div>
                    </div>
                    
                    <div className='flex items-center gap-4 p-3'>
                        <div className='w-6 h-6 flex items-center justify-center shrink-0'>
                            <i className="text-xl text-emerald-600 ri-cash-line"></i>
                        </div>
                        <div>
                            <h3 className='text-xl font-bold text-emerald-600'>₹{props.ride?.fare}</h3>
                            <p className='text-xs font-semibold text-gray-400'>CASH PAYMENT</p>
                        </div>
                    </div>
                </div>

                <div className='w-full mt-8'>
                    <form onSubmit={submitHandler} >
                        <input 
                            value={otp} 
                            onChange={(e)=>{setOtp(e.target.value)}} 
                            className='bg-gray-100 text-center px-6 py-4 rounded-xl w-full text-2xl font-bold font-mono tracking-widest text-[#0f172a] outline-none border-2 border-transparent focus:border-emerald-500 transition-colors'
                            type="number" 
                            placeholder='ENTER OTP' 
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full mt-4 text-lg text-white font-bold p-4 rounded-xl shadow-lg shadow-emerald-500/30 transition-colors ${loading ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                        >
                            {loading ? <i className="ri-loader-4-line animate-spin text-2xl"></i> : 'Confirm & Start Ride'}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => {
                                if (props.cancelRide) {
                                    props.cancelRide();
                                }
                            }} 
                            className='w-full mt-4 text-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors font-bold p-4 rounded-xl'
                        >
                            Cancel Ride
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ConfirmRidePopUp