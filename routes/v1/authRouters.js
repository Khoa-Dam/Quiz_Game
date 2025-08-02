import express from "express";
import { register, login,logout, sendVerifyOtp, verifyEmail, isAuthenticated, sendResetOtp, resetPassword } from "../../controllers/auth/authController.js";
import userAuth from "../../middleware/userAuth.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
//Verify email
authRouter.post("/send-verify-otp", userAuth, sendVerifyOtp);
authRouter.post("/verify-account", userAuth, verifyEmail);
authRouter.post("/is-auth", userAuth, isAuthenticated);
//Reset password
authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/reset-password", resetPassword);



export default authRouter;