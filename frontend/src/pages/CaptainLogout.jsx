import React, { useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const CaptainLogout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const logout = async () => {
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_BASE_URL}/captains/logout`,{},
                    {
                        withCredentials: true
                    }
                );

                console.log(response.data);

                localStorage.removeItem("captain-token");

                navigate('/captain-login');

            } catch (error) {
                console.log(error.response?.data || error.message);
                navigate('/captain-login');
            }
        };

        logout();
    }, [navigate]);

    return <div>Logging out Captain...</div>;
}

export default CaptainLogout;