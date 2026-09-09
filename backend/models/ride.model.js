import mongoose, { Schema } from "mongoose";

const rideSchema=new mongoose.Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    captain:{
        type:Schema.Types.ObjectId,
        ref:"Captain",
        
    },
    pickup:{
        type:String,
        required:true
    },
    destination:{
        type:String,
        required:true
    },
    fare:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        enum:["pending","accepted","completed","cancelled","ongoing"],
        default:"pending"
    },
    duration:{
        type:Number
    },
    distance:{
        type:Number, //in meteres
    },
    paymentId:{
        type:String,
    },
    orderId:{
        type:String
    },
    signature:{
        type:String
    },otp:{
        type:String,
        select:false,
        required:true
    }
},{timestamps:true});

export const rideModel=mongoose.model("Ride",rideSchema)