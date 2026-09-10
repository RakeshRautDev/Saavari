import mongoose from 'mongoose';
import { captainModel } from './backend/models/captain.model.js';

async function test() {
    // using env var or simple connection string
    await mongoose.connect(process.env.DB_CONNECT || 'mongodb+srv://rakeshdb:rakeshdb123@cluster0.qmgyimm.mongodb.net/uber');
    
    try {
        const captains = await captainModel.find({
            location: {
                $geoWithin: { $centerSphere: [ [ 85.84, 20.26 ], 200/6371 ] }
            }
        });
        console.log("Success:", captains);
    } catch (e) {
        console.error("Error with location object:", e.message);
        try {
            const rawCaptains = await captainModel.collection.find({
                location: {
                    $geoWithin: { $centerSphere: [ [ 85.84, 20.26 ], 200/6371 ] }
                }
            }).toArray();
            console.log("Success with native driver:", rawCaptains.length);
        } catch(e3) {
            console.error("Native driver error:", e3.message);
        }
    }
    mongoose.disconnect();
}
test();
