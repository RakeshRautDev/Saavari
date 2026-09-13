import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import 'remixicon/fonts/remixicon.css';

const UserHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/user-history`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('user-token')}` },
                    withCredentials: true
                });
                setHistory(response.data);
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    return (
        <div className='h-screen bg-gray-50 flex flex-col'>
            {/* Header */}
            <div className='bg-white p-5 flex items-center justify-between shadow-sm z-10'>
                <div className='flex items-center gap-4'>
                    <Link to='/home' className='h-10 w-10 bg-gray-100 flex items-center justify-center rounded-full'>
                        <i className="text-xl font-medium ri-arrow-left-line"></i>
                    </Link>
                    <h2 className='text-2xl font-bold'>My Trips</h2>
                </div>
            </div>

            {/* List */}
            <div className='p-4 flex-1 overflow-y-auto'>
                {loading ? (
                    <div className='flex justify-center items-center h-full'>
                        <p className='text-gray-500'>Loading your trips...</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className='flex flex-col justify-center items-center h-full text-center'>
                        <i className="ri-route-line text-6xl text-gray-300 mb-4"></i>
                        <h3 className='text-xl font-semibold text-gray-700'>No trips yet</h3>
                        <p className='text-gray-500 mt-2'>Your completed rides will appear here.</p>
                    </div>
                ) : (
                    <div className='flex flex-col gap-4'>
                        {history.map(ride => (
                            <div key={ride._id} className='bg-white p-4 rounded-xl shadow-sm border border-gray-100'>
                                <div className='flex justify-between items-center mb-4'>
                                    <span className='text-sm text-gray-500'>
                                        {new Date(ride.createdAt).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', year: 'numeric',
                                            hour: 'numeric', minute: 'numeric'
                                        })}
                                    </span>
                                    <span className='font-bold text-lg'>₹{ride.fare}</span>
                                </div>

                                <div className='flex flex-col gap-3 relative'>
                                    <div className='absolute left-2.5 top-5 bottom-5 w-[2px] bg-gray-800 rounded'></div>
                                    
                                    <div className='flex items-start gap-4'>
                                        <div className='mt-1 bg-gray-800 h-5 w-5 rounded-full flex items-center justify-center relative z-10'>
                                            <div className='h-2 w-2 bg-white rounded-full'></div>
                                        </div>
                                        <div>
                                            <p className='text-gray-800 font-medium'>{ride.pickup.split(",")[0]}</p>
                                            <p className='text-xs text-gray-500 truncate w-48 sm:w-64'>{ride.pickup.split(",").slice(1).join(",")}</p>
                                        </div>
                                    </div>

                                    <div className='flex items-start gap-4'>
                                        <div className='mt-1 bg-gray-800 h-5 w-5 rounded-sm flex items-center justify-center relative z-10'>
                                            <div className='h-2 w-2 bg-white rounded-sm'></div>
                                        </div>
                                        <div>
                                            <p className='text-gray-800 font-medium'>{ride.destination.split(",")[0]}</p>
                                            <p className='text-xs text-gray-500 truncate w-48 sm:w-64'>{ride.destination.split(",").slice(1).join(",")}</p>
                                        </div>
                                    </div>
                                </div>

                                {ride.captain && (
                                    <div className='mt-4 pt-4 border-t border-gray-100 flex items-center gap-3'>
                                        <div className='h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-xl'>
                                            👨‍✈️
                                        </div>
                                        <div>
                                            <p className='text-sm font-medium'>Driven by {ride.captain.fullname?.firstname || "Captain"}</p>
                                            <p className='text-xs text-gray-500'>
                                                {ride.captain.vehicle?.color} {ride.captain.vehicle?.plate}
                                            </p>
                                        </div>
                                        <div className={`ml-auto text-xs px-2 py-1 rounded-md font-medium ${ride.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {ride.status.toUpperCase()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserHistory;
