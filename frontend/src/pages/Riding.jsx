import React, { useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { socketContextData } from './../context/SocketContext';

const Riding = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [rideData, setRideData] = React.useState(location.state?.ride || null);

    const { socket, receiveMessage } = useContext(socketContextData);

    useEffect(() => {
        if (!rideData) {
            import('axios').then(axios => {
                axios.default.get(`${import.meta.env.VITE_BASE_URL}/rides/user-current-ride`, {
                    withCredentials: true
                }).then(response => {
                    if (response.data && response.data.status === 'ongoing') {
                        setRideData(response.data);
                    } else {
                        navigate('/home'); // Send back if no active ride
                    }
                }).catch(err => {
                    navigate('/home');
                });
            });
        }
    }, [rideData, navigate]);

    useEffect(() => {
        if (!socket) return;

        const cleanup = receiveMessage("ride-ended", (ride) => {
            console.log("Ride ended:", ride);

            // Go back to home after captain ends ride
            navigate("/home");
        });

        return cleanup;

    }, [socket]);

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
                        <h2 className='text-lg font-medium'>
                            {rideData?.captain?.fullname?.firstname + " " +
                             rideData?.captain?.fullname?.lastname}
                        </h2>

                        <h4 className='text-xl font-semibold -mt-1 -mb-1'>
                            {rideData?.captain?.vehicle?.plate}
                        </h4>

                        <p className='text-sm text-gray-600'>
                            {rideData?.captain?.vehicle?.vehicleType}
                        </p>
                    </div>
                </div>

                <div className='w-full mt-3'>

                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill"></i>

                        <div>
                            <h3 className='text-lg font-medium'>
                                {rideData?.captain?.vehicle?.plate}
                            </h3>

                            <p className='text-sm -mt-1 text-gray-600'>
                                {rideData?.pickup?.split(",")[0]}
                            </p>
                        </div>
                    </div>

                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line"></i>

                        <div>
                            <h3 className='text-lg font-medium'>
                                ₹{rideData?.fare}
                            </h3>

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
    );
};

export default Riding;