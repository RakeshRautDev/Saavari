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
    pickupCoords: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },
    destination:{
        type:String,
        required:true
    },
    destinationCoords: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },
    fare:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        enum:["pending","accepted","captain_arriving","captain_arrived","ongoing","completed","cancelled"],
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
    },
    userRating: {
        type: Number,
        min: 1,
        max: 5
    },
    captainRating: {
        type: Number,
        min: 1,
        max: 5
    },
    otp:{
        type:String,
        select:false,
        required:true
    },
    messages: [{
        senderType: { type: String, enum: ['user', 'captain'] },
        content: String,
        timestamp: { type: Date, default: Date.now }
    }]
},{timestamps:true});

export const rideModel=mongoose.model("Ride",rideSchema)