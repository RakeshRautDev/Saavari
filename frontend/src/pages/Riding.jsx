import React from 'react'
import { Link } from 'react-router-dom'

const Riding = () => {
    return (
        <div className='h-screen overflow-hidden'>
    <Link
        to='/home'
        className='fixed right-2 top-2 h-10 w-10 bg-white flex items-center justify-center rounded-full z-10'
    >
        <i className="text-lg font-medium ri-home-5-line"></i>
    </Link>

    {/* Map */}
    <div className='h-1/2'>
        <img
            className='h-full w-full object-cover'
            src="https://miro.medium.com/v2/resize:fit:1100/format:webp/0*gwMx05pqII5hbfmX.gif"
            alt=""
        />
    </div>

    {/* Ride details */}
    <div className='h-1/2 p-4 overflow-hidden'>

        <div className='flex items-center justify-between'>
            <img
                className='h-16'
                src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg"
                alt=""
            />

            <div className='text-right'>
                <h2 className='text-lg font-medium'>Rakesh</h2>
                <h4 className='text-xl font-semibold -mt-1 -mb-1'>
                    DL01 AB 1234
                </h4>
                <p className='text-sm text-gray-600'>Swift Dzire</p>
            </div>
        </div>

        <div className='w-full mt-3'>

            <div className='flex items-center gap-5 p-3 border-b-2'>
                <i className="text-lg ri-map-pin-2-fill"></i>

                <div>
                    <h3 className='text-lg font-medium'>562/11-A</h3>
                    <p className='text-sm -mt-1 text-gray-600'>
                        IGI AIRPORT
                    </p>
                </div>
            </div>

            <div className='flex items-center gap-5 p-3'>
                <i className="ri-currency-line"></i>

                <div>
                    <h3 className='text-lg font-medium'>₹203</h3>
                    <p className='text-sm -mt-1 text-gray-600'>
                        Cash Cash
                    </p>
                </div>
            </div>

        </div>

        <button className='w-full mt-3 bg-green-600 text-white font-semibold p-2 rounded-lg'>
            Make A Payment
        </button>

    </div>
</div>
    )
}

export default Riding