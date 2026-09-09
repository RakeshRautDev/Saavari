import React from 'react'

const CaptainDetails = () => {
  return (
    <div className=''>
        <div className='flex items-center justify-between'>
          <div className='flex items-center justify-between gap-3'>
            <img className='h-15 w-15 rounded-full object-cover' src="https://mediaproxy.tvtropes.org/width/1200/https://static.tvtropes.org/pmwiki/pub/images/megan_fox_9.jpg" alt="" />
            <h4 className='text-lg font-medium'>Sumit Patra</h4>
          </div>
          <div>
            <h4 className='text-xl font-semibold'>₹244</h4>
            <p className='text-sm font-medium text-gray-600'>Earned</p>
          </div>
        </div>


        <div className='flex p-3 mt-2 bg-gray-100 rounded-xl justify-center gap-5 items-start'>
          <div className='text-center'>
            <i className='ri-timer-2-line text-3xl mb-2 font-thin'>
              <h5 className='text-lg font-medium'>10.3</h5>
              <p className='text-sm text-gray-600'>Hours Online</p>
            </i>
          </div>
          <div className='text-center'>
            <i className='ri-speed-up-line text-3xl mb-2 font-thin'>
              <h5 className='text-lg font-medium'>10.3</h5>
              <p className='text-sm text-gray-600'>Hours Online</p>
            </i>
          </div>
          <div className='text-center'>
            <i className='ri-booklet-line text-3xl mb-2 font-thin'>
              <h5 className='text-lg font-medium'>10.3</h5>
              <p className='text-sm text-gray-600'>Hours Online</p>
            </i>
          </div>

        </div>



      </div>
  )
}

export default CaptainDetails