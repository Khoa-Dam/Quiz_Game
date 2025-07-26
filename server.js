import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRouters.js";
import userRouter from "./routes/userRouters.js";

const app = express();
const port = process.env.PORT || 3000;
connectDB();

app.use(cors({credentials: true}));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("API working");
});
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});