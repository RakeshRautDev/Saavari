import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

export const CaptainDataContext = createContext();

const CaptainContext = ({ children }) => {

    const [captain, setCaptain] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const checkAuth = async () => {
            try {

                const response = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/captains/profile`,
                    {
                        withCredentials: true
                    }
                );

                setCaptain(response.data.captain);

            } catch (error) {

                setCaptain(null);

            } finally {

                setLoading(false);

            }
        };

        checkAuth();

    }, []);

    return (
        <CaptainDataContext.Provider
            value={{
                captain,
                setCaptain,
                loading
            }}
        >
            {children}
        </CaptainDataContext.Provider>
    );
};

export default CaptainContext;