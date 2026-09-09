import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const ConfirmRidePopUp = (props) => {

    const [otp,setOtp]=useState("");

    const submitHandler=(e)=>{
        e.preventDefault();
    }
    return (
        <div>
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                props.setRidePopUpPanel(false)
            }}><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>
            <h3 className='text-2xl font-semibold mb-5'>Confirm this ride to Start</h3>

            <div className='flex items-center justify-between p-3 mt-4 bg-yellow-400 rounded-lg'>
                <div className='flex items-center gap-3'>
                    <img className='h-15 w-15 rounded-full' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1Fz0ia5xvZzagpvuXp61ZUykVIngr6EdiiNm8yWw4aUBqTNJ-m7N0HEY&s=10" alt="" />
                    <h2 className='text-xl font-medium'>Nandini Nayal</h2>
                </div>
                <h5 className='text-lg font-semibold'>2.2 KM</h5>
            </div>

            <div className='flex gap-2 justify-between flex-col items-center'>
                <div className='w-full mt-5'>
                    <div className='flex items-center gap-5 p-3 border-gray-200 border-b-2'>
                        <i className="ri-map-pin-user-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>562/11-A</h3>
                            <p className='text-sm -mt-1 text-gray-600'>Indira Gandhi International Airport, New Delhi</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3 border-gray-200 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>562/11-A</h3>
                            <p className='text-sm -mt-1 text-gray-600'>New Delhi Railway Station, New Delhi</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹203</h3>
                            <p className='text-sm -mt-1 text-gray-600'>Cash Cash</p>
                        </div>
                    </div>
                </div>
                <div className='w-full mt-6'>
                    <form onSubmit={submitHandler} >
                        <input value={otp} onChange={(e)=>{setOtp(e.target.value)}} className='bg-[#eee] text-center px-6 py-4 text-base rounded-lg w-full text-lg mt-3 font-mono'
                         type="number" placeholder='Enter OTP' />
                        <Link to="/captain-riding" onClick={() => {

                            props.setRidePopUpPanel(false)
                            props.setConfirmRidePopUpPanel(false);
                            // props.createRide()

                        }} className='w-full text-lg inline-block text-center mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg'>Confirm</Link>
                        <button onClick={() => {

                            props.setConfirmRidePopUpPanel(false)
                            props.setRidePopUpPanel(false)
                            // props.createRide()

                        }} className='w-full mt-5 text-lg bg-red-400 text-white font-semibold p-2 rounded-lg'>Cancel</button>

                    </form>
                </div>
            </div>
        </div>
    )
}

export default ConfirmRidePopUp