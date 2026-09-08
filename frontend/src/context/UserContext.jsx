import React, { createContext, useEffect, useState } from 'react'
import axios from 'axios'

export const UserDataContext = createContext()

const UserContext = ({ children }) => {

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {

        const checkAuth = async () => {
            try {

                const response = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/users/profile`,
                    {
                        withCredentials: true
                    }
                )

                setUser(response.data.user)

            } catch (error) {

                setUser(null)

            } finally {

                setLoading(false)

            }
        }

        checkAuth()

    }, [])

    return (
        <UserDataContext.Provider
            value={{
                user,
                setUser,
                loading
            }}
        >
            {children}
        </UserDataContext.Provider>
    )
}

export default UserContext