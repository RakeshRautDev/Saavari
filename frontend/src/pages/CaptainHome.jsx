import React, { useContext } from 'react'
import { CaptainDataContext } from '../context/CaptainContext'

const CaptainHome = () => {
    const data=useContext(CaptainDataContext);
    console.log(data);
    
  return (
    <div>CaptainHome</div>
  )
}

export default CaptainHome