import React, { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { CaptainDataContext } from '../context/CaptainContext'

const CaptainProtectedWrapper = () => {

    const { captain, loading } = useContext(CaptainDataContext)

    if (loading) {
        return <div>Loading...</div>
    }

    if (!captain) {
        return <Navigate to="/captain-login" replace />
    }

    return <Outlet />
}

export default CaptainProtectedWrapper