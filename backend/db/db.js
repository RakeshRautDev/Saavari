import mongoose from 'mongoose';

async function connectDb() {
    try {
        const connectionInstance = await mongoose.connect(
            process.env.DATABASE_URL
        );

        console.log(
            `MongoDB connected: ${connectionInstance.connection.host}`
        );

    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
}


export default connectDb;