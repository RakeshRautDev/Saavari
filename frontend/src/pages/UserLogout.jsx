import React, { useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const UserLogout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const logout = async () => {
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_BASE_URL}/users/logout`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('user-token')}`
                        },
                        withCredentials: true
                    }
                );

                console.log(response.data);

                localStorage.removeItem("user-token");

                navigate('/login');

            } catch (error) {
                console.log(error.response?.data || error.message);
                navigate('/login');
            }
        };

        logout();
    }, [navigate]);

    return <div>Logging out...</div>;
}

export default UserLogout;