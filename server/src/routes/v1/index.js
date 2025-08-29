import express from "express";

import authRouter from "./authRouters.js";
import userRouter from "./userRouters.js";
import quizRouter from "./quizRouters.js";
import roomRouter from "./roomRoutes.js";

const v1Routes = express.Router();

v1Routes.use("/auth", authRouter);
v1Routes.use("/user", userRouter);
v1Routes.use("/quiz", quizRouter);
v1Routes.use("/room", roomRouter);

export default v1Routes;