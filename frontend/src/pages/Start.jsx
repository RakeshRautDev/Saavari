import React from 'react'
import { Link } from 'react-router-dom'
const Start = () => {
  return (
      <div className='bg-cover bg-center bg-[url(https://images.unsplash.com/photo-1619059558110-c45be64b73ae?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)] h-screen pt-8 flex justify-between flex-col w-full'>
      
      <img
        className="w-16 ml-18"
        src="https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoid2VhcmVcL2ZpbGVcLzhGbTh4cU5SZGZUVjUxYVh3bnEyLnN2ZyJ9:weare:F1cOF9Bps96cMy7r9Y2d7affBYsDeiDoIHfqZrbcxAw?width=1200&height=417"
        alt="Uber"
      />

      <div className="bg-white py-4 px-4 pb-7 w-full">
        <h2 className="text-3xl font-bold">
          Get Started with Uber
        </h2>

        <Link to="/login" className="inline-block text-center bg-black w-full text-white py-3 rounded mt-5">
          Continue
        </Link>
      </div>

    </div>
  )
}

export default Start