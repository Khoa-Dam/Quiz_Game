import express from "express";
import userAuth from "../../middleware/userAuth.js";
import {
  getUserData,
  updateUserData,
  upload,
} from "../../modules/user/user.Controller.js";

const userRouter = express.Router();

userRouter.get("/data", userAuth, getUserData);
userRouter.put(
  "/update",
  userAuth,
  upload.single("profilePicture"),
  updateUserData
);

export default userRouter;
