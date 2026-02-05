import mongoose from "mongoose";

const connnectedDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log("MongoDB connected successfully"));
        const baseUrl = process.env.MONGODB_URL;
        let mongoUrl = baseUrl;
        try {
            const url = new URL(baseUrl);
            // Always set DB name cleanly to avoid breaking query params
            url.pathname = "/food_order";
            mongoUrl = url.toString();
        } catch {
            // Fallback: if URL parsing fails, use the original env value
            mongoUrl = baseUrl;
        }
        await mongoose.connect(mongoUrl);
    } catch (error) {
        console.log("MongoDB connected Fails")
    }
}

export default connnectedDB;
