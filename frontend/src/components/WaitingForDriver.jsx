import React from 'react'

const WaitingForDriver = (props) => {
  const { rideData } = props;

  return (
    <div>
         <div>
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                props.setWaitingForDriver(false)
            }}><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>

            <div className='flex items-center justify-between'>
                <img className='h-20' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="" />
                <div className='text-right'>
                    <h2 className='text-lg font-medium'>
                        {rideData?.captain?.fullname?.firstname} {rideData?.captain?.fullname?.lastname}
                    </h2>
                    <h4 className='text-xl font-semibold -mt-1 -mb-1'>
                        {rideData?.captain?.vehicle?.plate || "—"}
                    </h4>
                    <p className='text-sm text-gray-600'>
                        {rideData?.captain?.vehicle?.color} {rideData?.captain?.vehicle?.vehicleType}
                    </p>
                    {/* OTP */}
                    <div className='mt-2 bg-yellow-400 rounded-lg px-4 py-1 inline-block'>
                        <p className='text-xs text-gray-700 font-medium'>Your OTP</p>
                        <h2 className='text-2xl font-bold tracking-widest'>{rideData?.otp || "----"}</h2>
                    </div>
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
            </div>
        </div>
    </div>
  )
}

export default WaitingForDriver