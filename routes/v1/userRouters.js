import express from "express";
import userAuth from "../../middleware/userAuth.js";
import upload from "../../config/multerConfig.js";
import { getUserData, updateUserProfile } from "../../controllers/user/userController.js";

const userRouter = express.Router();

userRouter.get("/data", userAuth, getUserData);
userRouter.put("/update", userAuth, upload.single("profilePicture"), updateUserProfile);
userRouter.post("/update", userAuth, upload.single("profilePicture"), updateUserProfile);

export default userRouter;