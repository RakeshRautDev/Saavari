import React from 'react'

const RidePopUp = (props) => {
    console.log("Ride data is ", props.ride)
  return (
    <div>
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                props.setRidePopUpPanel(false)
            }}><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>
            <h3 className='text-2xl font-semibold mb-5'>New Ride Available</h3>

<div className='flex items-center justify-between p-3 mt-4 bg-yellow-400 rounded-lg'>
    <div className='flex items-center gap-3'>
        <img className='h-15 w-15 rounded-full' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1Fz0ia5xvZzagpvuXp61ZUykVIngr6EdiiNm8yWw4aUBqTNJ-m7N0HEY&s=10" alt="" />
        {/* user is not populated in new-ride event — show "Passenger" as fallback */}
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
                <button onClick={() => {
                    props.setConfirmRidePopUpPanel(true)
                    props.setRidePopUpPanel(false)
                    props.confirmRide()
                }} className='w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg'>Accept</button>
                <button onClick={() => {
                    props.setRidePopUpPanel(false)
                    // Ignore — do NOT call confirmRide
                }} className='w-full mt-5 bg-gray-300 text-black font-semibold p-2 rounded-lg'>Ignore</button>
            </div>
        </div>
  )
}

export default RidePopUp