import React from 'react'

const WaitingForDriver = (props) => {
  const { rideData } = props;

  return (
    <div className="h-full bg-white relative flex flex-col">
        {/* HEADER (ALWAYS VISIBLE - 90px tall) */}
        <div 
            className="pt-3 pb-4 px-4 bg-white cursor-pointer border-b border-gray-100 flex-shrink-0"
            onClick={() => props.setWaitingForDriver(!props.waitingForDriver)}
        >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3"></div>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className='text-lg font-bold text-[#0f172a]'>Meet your driver</h3>
                    <p className='text-xs font-semibold text-emerald-600'>SWIPE OR CLICK TO EXPAND</p>
                </div>
                {/* OTP IN HEADER */}
                <div className='bg-yellow-400 rounded-lg px-4 py-1 text-center'>
                    <p className='text-[10px] text-gray-700 font-medium leading-tight'>OTP</p>
                    <h2 className='text-lg font-bold tracking-widest leading-tight'>{rideData?.otp || "----"}</h2>
                </div>
            </div>
        </div>

        {/* EXPANDABLE CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8">
            <div className='flex items-center justify-between mb-4'>
                <img className='h-20' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="" />
                <div className='text-right'>
                    <h2 className='text-lg font-medium'>
                        {rideData?.captain?.fullname?.firstname} {rideData?.captain?.fullname?.lastname}
                    </h2>
                    <h4 className='text-xl font-semibold -mt-1 -mb-1'>
                        {rideData?.captain?.vehicle?.plate || "-"}
                    </h4>
                    <p className='text-sm text-gray-600'>
                        {rideData?.captain?.vehicle?.color} {rideData?.captain?.vehicle?.vehicleType}
                    </p>
                    {props.captainETA && (
                        <p className='text-sm text-green-600 font-semibold mt-1'>
                            {(props.captainETA.distance / 1000).toFixed(1)} km away • {Math.ceil(props.captainETA.time / 60)} mins
                        </p>
                    )}
                </div>
            </div>

            <div className='flex gap-2 justify-between flex-col items-center'>
                <div className='w-full mt-5'>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-user-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>
                                {rideData?.pickup?.split(",")[0] || "Pickup"}
                            </h3>
                            <p className='text-sm -mt-1 text-gray-600'>
                                {rideData?.pickup?.split(",").slice(1).join(",") || ""}
                            </p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>
                                {rideData?.destination?.split(",")[0] || "Destination"}
                            </h3>
                            <p className='text-sm -mt-1 text-gray-600'>
                                {rideData?.destination?.split(",").slice(1).join(",") || ""}
                            </p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹{rideData?.fare}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>Cash</p>
                        </div>
                    </div>
                </div>
                {rideData && (
                    <button 
                        onClick={props.cancelRide}
                        className='w-full mt-4 bg-red-500 text-white font-semibold p-3 rounded-lg hover:bg-red-600 transition-colors'
                    >
                        Cancel Ride
                    </button>
                )}
            </div>
        </div>
    </div>
  )
}

export default WaitingForDriver