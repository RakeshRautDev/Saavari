import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FinishRide = (props) => {
const navigate=useNavigate()

    const endRideHandler = async () => {
        try {
            // rideData IS the ride object — no nested .ride property
            console.log("Ending ride:", props.rideData?._id)
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/rides/end-ride`,
                {
                    rideid: props.rideData?._id
                },
                {
                    withCredentials: true
                }
            );

            console.log("Ride ended:", response.data);
            navigate("/captain-home")

        } catch (error) {
            console.error(
                "Error ending ride:",
                error.response?.data || error.message
            );
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        await endRideHandler();
    };

    return (
        <div>
            <h5
                className='p-1 text-center w-[93%] absolute top-0'
                onClick={() => {
                    props.setfinish(false);
                }}
            >
                <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
            </h5>

            <h3 className='text-2xl font-semibold mb-5'>
                Finish this Ride
            </h3>

            <div className='flex items-center justify-between p-3 mt-4 border-2 border-yellow-400 rounded-lg'>
                <div className='flex items-center gap-3'>
                    <img
                        className='h-15 w-15 rounded-full'
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1Fz0ia5xvZzagpvuXp61ZUykVIngr6EdiiNm8yWw4aUBqTNJ-m7N0HEY&s=10"
                        alt=""
                    />

                    <h2 className='text-xl font-medium'>
                        {props.rideData?.user?.fullname?.firstname
                            ? props.rideData.user.fullname.firstname + " " + props.rideData.user.fullname.lastname
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
                            <h3 className='text-lg font-medium'>
                                {props.rideData?.pickup?.split(",")[0]}
                            </h3>

                            <p className='text-sm -mt-1 text-gray-600'>
                                {props.rideData?.pickup?.split(",").slice(1).join(",")}
                            </p>
                        </div>
                    </div>

                    <div className='flex items-center gap-5 p-3 border-gray-200 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill"></i>

                        <div>
                            <h3 className='text-lg font-medium'>
                                {props.rideData?.destination?.split(",")[0]}
                            </h3>

                            <p className='text-sm -mt-1 text-gray-600'>
                                {props.rideData?.destination?.split(",").slice(1).join(",")}
                            </p>
                        </div>
                    </div>

                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line"></i>

                        <div>
                            <h3 className='text-lg font-medium'>
                                ₹{props.rideData?.fare}
                            </h3>

                            <p className='text-sm -mt-1 text-gray-600'>
                                Cash Cash
                            </p>
                        </div>
                    </div>

                </div>

                <div className='w-full mt-6'>
                    <form onSubmit={submitHandler}>

                        <button
                            type="submit"
                            className='w-full inline-block text-lg text-center mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg'
                        >
                            Finish Ride
                        </button>

                        <p className='mt-6 text-xs text-center'>
                            Click “Finish” once the payment has been completed.
                        </p>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default FinishRide;