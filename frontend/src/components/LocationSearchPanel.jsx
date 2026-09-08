import React from 'react'

const LocationSearchPanel = (props) => {
console.log(props)
  const locations = [
    "7 RCR, Prime Minister's Residence, New Delhi",
    "Indira Gandhi International Airport, New Delhi",
    "New Delhi Railway Station, New Delhi",
    "India Gate, New Delhi",
    "Connaught Place, New Delhi",
    "Gurugram Cyber Hub, Gurugram",
    "Noida Sector 18, Noida",
    "Khan Market, New Delhi",
    "Saket, New Delhi",
    "Vasant Kunj, New Delhi"
  ];

  return (
    <div>
      {locations && locations.map((elem,index) => (<div key={index} 
      onClick={()=>
        {
          props.setvechiclePannel(true)
          props.setPannelOpen(false)
        }}
      
      className="flex gap-4 border-2 p-3  rounded-xl border-gray-100 active:border-black items-center my-4 justify-start">
        <h2 className='bg-[#eee] h-8 flex items-center justify-center w-10  rounded-full'><i className='ri-map-pin-fill '></i></h2>
        <h4 className='font-medium'>{elem}</h4>
      </div>))}




    </div>
  )
}

export default LocationSearchPanel