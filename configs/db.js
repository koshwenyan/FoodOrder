import mongoose from "mongoose";

const connnectedDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log("MongoDB connected successfully"));
        await mongoose.connect(`${process.env.MONGODB_URL}/food_order`)
    } catch (error) {
        console.log("MongoDB connected Fails")
    }
}

export default connnectedDB;