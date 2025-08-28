import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on("connected", () => {
        console.log("Connected to MongoDB");
    });
    mongoose.connection.on("error", (err) => {
        console.log("MongoDB connection error", err);
    });

    await mongoose.connect(process.env.MONGODB_URL);
}

export default connectDB;