import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserDataContext } from '../context/UserContext';
import 'remixicon/fonts/remixicon.css';

const UserProfile = () => {
    const { user } = useContext(UserDataContext);
    const navigate = useNavigate();

    if (!user) {
        return (
            <div className='h-screen flex items-center justify-center bg-gray-50'>
                <p className='text-gray-500'>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className='h-screen bg-gray-50 flex flex-col'>
            {/* Header */}
            <div className='bg-white p-5 flex items-center justify-between shadow-sm z-10'>
                <div className='flex items-center gap-4'>
                    <Link to='/home' className='h-10 w-10 bg-gray-100 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors'>
                        <i className="text-xl font-medium ri-arrow-left-line"></i>
                    </Link>
                    <h1 className='text-2xl font-bold text-gray-800'>My Profile</h1>
                </div>
            </div>

            {/* Content */}
            <div className='flex-1 overflow-y-auto p-5'>
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                    <div className='p-6 flex flex-col items-center border-b border-gray-100'>
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Profile" className='w-24 h-24 rounded-full object-cover border-4 border-emerald-50 mb-4 shadow-sm' />
                        ) : (
                            <div className='w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border-4 border-emerald-50 mb-4 shadow-sm'>
                                <i className="ri-user-fill text-4xl"></i>
                            </div>
                        )}
                        <h2 className='text-xl font-bold text-gray-800 capitalize'>{user.fullname.firstname} {user.fullname.lastname}</h2>
                        <p className='text-gray-500 text-sm mt-1'>{user.email}</p>
                    </div>

                    <div className='p-2'>
                        <Link to='/user/history' className='flex items-center justify-between p-4 hover:bg-gray-50 transition-colors'>
                            <div className='flex items-center gap-3 text-gray-700'>
                                <i className="ri-history-line text-xl text-emerald-500"></i>
                                <span className='font-medium'>Ride History</span>
                            </div>
                            <i className="ri-arrow-right-s-line text-gray-400 text-xl"></i>
                        </Link>

                        <div className='w-full h-[1px] bg-gray-100'></div>

                        <Link to='/user/logout' className='flex items-center justify-between p-4 hover:bg-red-50 transition-colors'>
                            <div className='flex items-center gap-3 text-red-600'>
                                <i className="ri-logout-circle-line text-xl"></i>
                                <span className='font-medium'>Logout</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
