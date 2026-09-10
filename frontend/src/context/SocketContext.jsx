
import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const socketContextData = createContext();

const SocketProvider = ({ children }) => {

    const [socket, setSocket] = useState(null);

    useEffect(() => {

        // Connect to backend
        const newSocket = io(import.meta.env.VITE_BASE_URL, {
            withCredentials: true
        });

        setSocket(newSocket);

        // When connected
        newSocket.on("connect", () => {
            console.log("Connected to server:", newSocket.id);
        });

        // When disconnected
        newSocket.on("disconnect", () => {
            console.log("Disconnected from server");
        });

        // Cleanup
        return () => {
            newSocket.disconnect();
        };

    }, []);


    // Send message
    const sendMessage = (event, data) => {
        if (socket) {
            socket.emit(event, data);
        }
    };


    // Receive message — returns a cleanup fn to call in useEffect
    const receiveMessage = (event, callback) => {
        if (socket) {
            socket.on(event, callback);
            return () => socket.off(event, callback);
        }
        return () => {};
    };


    return (
        <socketContextData.Provider
            value={{
                socket,
                sendMessage,
                receiveMessage
            }}
        >
            {children}
        </socketContextData.Provider>
    );
};

export default SocketProvider;

