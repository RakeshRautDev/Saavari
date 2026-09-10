import { Server } from "socket.io";
import { User } from "./models/user.model.js";
import { captainModel } from "./models/captain.model.js";


let io;

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        socket.on("join", async(data)=>{
            const{userId,userType}=data;
            if(userType==="user"){
                await User.findByIdAndUpdate(userId,{socketId:socket.id});
                console.log("User socketId set in database")
                socket.emit("User conneected to server")
            }
            else{
                await captainModel.findByIdAndUpdate(userId,{socketId:socket.id})
                console.log("Captain socketId set in database")
                socket.emit("Captain conneected to server")
            }
        })

        socket.on("update-location-captain",async (data)=>{
            const {userId,location}=data;
            console.log(userId, location)

            if(!location || !location.lat || !location.lng){
                return socket.emit("error",{message:"Invalid location data"});
            }
            console.log(`User ${userId} updated location to ${location}`);

            const res=await captainModel.findByIdAndUpdate(userId,{location:{lat:location.lat,lng:location.lng}});
            console.log(res);
            
        })

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    return io;
};

const sendMessageToSocketId = (socketId, event, message) => {
    if (!io) {
        console.log("Socket.io is not initialized");
        return;
    }

    io.to(socketId).emit(event, message);
};

export {
    initializeSocket,
    sendMessageToSocketId
};