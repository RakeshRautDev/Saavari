import "dotenv/config"
import express from "express"
import cors from "cors"
import connectDb from "./db/db.js";
import userRoutes from "./routes/user.routes.js"
import captainRoutes from "./routes/captain.routes.js"
import cookieParser from "cookie-parser";
import mapsRoutes from "./routes/maps.route.js"
import rideRoutes from "./routes/ride.routes.js";

const app=express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}))
connectDb();

app.use((req, res, next) => {
    console.log("REQUEST RECEIVED:", req.method, req.url);
    next();
});

app.get('/',(req,res)=>{
    res.send("Hello World");
})

app.use('/users', userRoutes);
app.use("/captains",captainRoutes)
app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error"
    });
});


app.use("/maps",mapsRoutes)
app.use("/rides",rideRoutes)


export default app;