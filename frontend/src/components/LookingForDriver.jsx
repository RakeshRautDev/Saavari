import React from 'react'

const LookingForDriver = (props) => {
    // If local state was wiped by a page refresh, use the rideData fetched from the backend
    const pickup = props.pickup || props.rideData?.pickup || "";
    const destination = props.destination || props.rideData?.destination || "";
    const fare = (props.fare && props.selectedVehicle) ? props.fare[props.selectedVehicle] : props.rideData?.fare || 0;
    
    // We don't save vehicleType in the backend right now, so if refreshed, we fallback to a car image
    const vehicleImage = props.image?.[props.selectedVehicle] || "https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg";

    return (
        <div>

         
            <h5 className='p-1 text-center w-[93%]' onClick={() => {
                props.setVehicleFound(false)
            }}><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>
            <h3 className='text-2xl font-semibold mb-5'>Looking for a Driver</h3>

            <div className='flex gap-2 justify-between flex-col items-center'>
                <img className='h-20' src={vehicleImage} alt="" />
                <div className='w-full mt-5'>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-user-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>{pickup.split(",")[0] || "Pickup"}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{pickup.split(",").slice(1).join(",")}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>{destination.split(",")[0] || "Destination"}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{destination.split(",").slice(1).join(",")}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹{fare}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>Cash</p>
                        </div>
                    </div>
                </div>
                {props.rideData && (
                    <button 
                        onClick={props.cancelRide}
                        className='w-full mt-4 bg-red-500 text-white font-semibold p-3 rounded-lg hover:bg-red-600'
                    >
                        Cancel Ride
                    </button>
                )}
            </div>
        </div>
    )
}

export default LookingForDriver