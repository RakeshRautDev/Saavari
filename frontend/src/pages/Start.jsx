import React from 'react'
import { Link } from 'react-router-dom'

const Start = () => {
  return (
    <div className='h-screen flex flex-col overflow-hidden relative'>
      {/* Background gradient */}
      <div className='absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0f172a]' />

      {/* Animated grid overlay */}
      <div className='absolute inset-0 opacity-10'
        style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Content */}
      <div className='relative z-10 flex flex-col h-full'>

        {/* Top area — logo & tagline */}
        <div className='flex-1 flex flex-col items-center justify-center px-8 text-center'>

          {/* Logo icon */}
          <div className='mb-6 w-20 h-20 rounded-3xl bg-blue-500 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.6)]'>
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <path d="M8 22L22 8L36 22" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 8V38" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
              <circle cx="8" cy="34" r="4" fill="white"/>
              <circle cx="36" cy="34" r="4" fill="white"/>
            </svg>
          </div>

          {/* Wordmark */}
          <h1 className='text-white text-6xl font-black tracking-tight mb-2'>
            Sawari
          </h1>
          <p className='text-blue-300 text-lg font-medium tracking-widest uppercase mb-3'>
            सवारी
          </p>
          <p className='text-slate-400 text-base mt-2'>
            Your city. Your ride. Anytime.
          </p>
        </div>

        {/* Bottom CTA card */}
        <div className='bg-white rounded-t-3xl px-7 pt-8 pb-10 shadow-2xl'>
          <h2 className='text-2xl font-bold text-[#0f172a] mb-2'>Get Started</h2>
          <p className='text-gray-500 text-sm mb-6'>Fast, safe, and affordable rides — right at your fingertips.</p>

          <Link
            to="/login"
            className='block w-full text-center bg-[#0f172a] text-white font-semibold py-4 rounded-2xl text-base hover:bg-blue-600 transition-all duration-300 shadow-lg'
          >
            Continue as Passenger
          </Link>

          <Link
            to="/captain-login"
            className='block w-full text-center bg-transparent border-2 border-[#0f172a] text-[#0f172a] font-semibold py-4 rounded-2xl text-base mt-3 hover:bg-gray-50 transition-all duration-300'
          >
            Drive with Sawari
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Start