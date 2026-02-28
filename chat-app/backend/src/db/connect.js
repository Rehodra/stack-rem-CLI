import mongoose from "mongoose";

const connectDb= async () =>{
    try {
        await mongoose.connect(process.env.MONGO_DB_URI)
        console.log("Database connected successfully");
    } catch (error) {
        console.log("Database connection error:", error.message);
    }
}

export default connectDb;