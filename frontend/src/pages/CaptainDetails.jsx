import React, { useContext, useEffect, useState } from 'react'
import { CaptainDataContext } from '../context/CaptainContext.jsx';
import axios from 'axios';

const CaptainDetails = () => {
  const {captain}=useContext(CaptainDataContext);
  const [stats, setStats] = useState({ totalRides: 0, totalEarnings: 0 });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/captain-analytics`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('captain-token')}` },
          withCredentials: true
        });
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className=''>
        <div className='flex items-center justify-between'>
          <div className='flex items-center justify-between gap-3'>
            {captain.avatarUrl ? (
                <img className='h-12 w-12 rounded-full object-cover border border-gray-200' src={captain.avatarUrl} alt="Avatar" />
            ) : (
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200">
                    <i className="ri-user-fill text-xl"></i>
                </div>
            )}
            <h4 className='text-lg font-medium uppercase '>{captain.fullname.firstname +" "+ captain.fullname.lastname}
            </h4>
          </div>
          <div>
            <h4 className='text-xl font-semibold'>₹{stats.totalEarnings}</h4>
            <p className='text-sm font-medium text-gray-600'>Earned</p>
          </div>
        </div>


        <div className='flex p-3 mt-2 bg-gray-100 rounded-xl justify-center gap-5 items-start'>
          <div className='text-center'>
            <i className='ri-route-line text-3xl mb-2 font-thin'>
              <h5 className='text-lg font-medium'>{stats.totalRides}</h5>
              <p className='text-sm text-gray-600'>Total Trips</p>
            </i>
          </div>
          <div className='text-center'>
            <i className='ri-star-line text-3xl mb-2 font-thin'>
              <h5 className='text-lg font-medium'>{captain.averageRating?.toFixed(1) || "5.0"}</h5>
              <p className='text-sm text-gray-600'>Rating</p>
            </i>
          </div>
        </div>

      </div>
  )
}

export default CaptainDetails