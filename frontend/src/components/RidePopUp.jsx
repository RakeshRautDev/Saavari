import React from 'react'

const RidePopUp = (props) => {
    console.log("Ride data is ", props.ride)
    return (
        <div className="px-4 pt-4 pb-8 bg-white relative">
            <h5 className='p-1 text-center w-full absolute top-0 left-0 text-gray-300 hover:text-gray-500 cursor-pointer transition-colors' onClick={() => {
                props.setRidePopUpPanel(false)
            }}>
                <i className="text-3xl ri-subtract-line font-black"></i>
            </h5>
            
            <h3 className='text-2xl font-bold mb-5 mt-2 text-[#0f172a] text-center'>New Ride Request</h3>

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
                <div className='text-right'>
                    <h5 className='text-xl font-black text-emerald-600'>
                        {props.distanceETA ? `${(props.distanceETA.distance / 1000).toFixed(1)} km` : <i className="ri-loader-4-line animate-spin inline-block"></i>}
                    </h5>
                    <p className='text-xs font-semibold text-emerald-600/70'>DISTANCE</p>
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

            <div className='flex items-center gap-4 w-full mt-6'>
                <button onClick={() => {
                    props.setRidePopUpPanel(false);
                    if (props.setRide) props.setRide(null);
                }} className='flex-1 bg-gray-100 text-gray-600 font-bold p-3.5 rounded-xl hover:bg-gray-200 transition-colors'>
                    Ignore
                </button>
                <button onClick={() => {
                    props.setConfirmRidePopUpPanel(true)
                    props.confirmRide()
                    if (props.fetchRoute) {
                        props.fetchRoute();
                    }
                }} 
                disabled={props.isLoadingRoute}
                className={`flex-[2] bg-emerald-500 text-white font-bold p-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30 ${props.isLoadingRoute ? 'opacity-70 cursor-not-allowed' : ''}`}>
                    {props.isLoadingRoute && <i className="ri-loader-4-line animate-spin text-xl"></i>}
                    Accept Ride
                </button>
            </div>
        </div>
    )
}

export default RidePopUp