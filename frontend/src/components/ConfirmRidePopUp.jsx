import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from "axios"
const ConfirmRidePopUp = (props) => {

    const [otp,setOtp]=useState("");
    const navigate=useNavigate();

   const submitHandler = async (e) => {
    e.preventDefault();

    try {
        const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/rides/start-ride`,
            {
                params: {
                    rideId: props.ride?._id,
                    otp
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
    }
};
    return (
        <div>
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                props.setConfirmRidePopUpPanel(false)
            }}><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>
            <h3 className='text-2xl font-semibold mb-5'>Confirm this ride to Start</h3>

            <div className='flex items-center justify-between p-3 mt-4 bg-yellow-400 rounded-lg'>
                <div className='flex items-center gap-3'>
                    <img className='h-15 w-15 rounded-full' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1Fz0ia5xvZzagpvuXp61ZUykVIngr6EdiiNm8yWw4aUBqTNJ-m7N0HEY&s=10" alt="" />
                    {/* user may not be populated — show fallback */}
                    <h2 className='text-xl font-medium'>
                        {props.ride?.user?.fullname?.firstname
                            ? props.ride.user.fullname.firstname + " " + props.ride.user.fullname.lastname
                            : "Passenger"}
                    </h2>
                </div>
                <h5 className='text-lg font-semibold'>2.2 KM</h5>
            </div>

            <div className='flex gap-2 justify-between flex-col items-center'>
                <div className='w-full mt-5'>
                    <div className='flex items-center gap-5 p-3 border-gray-200 border-b-2'>
                        <i className="ri-map-pin-user-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>{props.ride?.pickup?.split(",")[0]}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{props.ride?.pickup?.split(",").slice(1).join(",")}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3 border-gray-200 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>{props.ride?.destination?.split(",")[0]}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{props.ride?.destination?.split(",").slice(1).join(",")}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹{props.ride?.fare}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>Cash</p>
                        </div>
                    </div>
                </div>
                <div className='w-full mt-6'>
                    <form onSubmit={submitHandler} >
                        <input value={otp} onChange={(e)=>{setOtp(e.target.value)}} className='bg-[#eee] text-center px-6 py-4 text-base rounded-lg w-full text-lg mt-3 font-mono'
                         type="number" placeholder='Enter OTP' />
                        {/* type="submit" so it triggers the form's onSubmit → submitHandler */}
                        <button
                         type="submit"
                         className='w-full text-lg inline-block text-center mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg'>Confirm</button>
                        <button type="button" onClick={() => {
                            props.setConfirmRidePopUpPanel(false)
                            props.setRidePopUpPanel(false)
                        }} className='w-full mt-5 text-lg bg-red-400 text-white font-semibold p-2 rounded-lg'>Cancel</button>

                    </form>
                </div>
            </div>
        </div>
    )
}

export default ConfirmRidePopUp