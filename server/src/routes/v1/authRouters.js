import express from "express";
import { register, login, logout, sendVerifyOtp, verifyEmail, isAuthenticated, sendResetOtp, resetPassword } from "../../modules/auth/auth.Controller.js";
import userAuth from "../../middleware/userAuth.js";
import { googleStart, googleCallback } from "../../modules/auth/google/google.Controller.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/reset-password", resetPassword);

//Verify email
authRouter.post("/send-verify-otp", userAuth, sendVerifyOtp);
authRouter.post("/verify-account", userAuth, verifyEmail);
authRouter.post("/is-auth", userAuth, isAuthenticated);

// GOOGLE OAUTH
authRouter.get("/google", googleStart);                 // redirect sang Google
authRouter.get("/google/callback", googleCallback);     // Google gọi về


export default authRouter;