import bcrypt from "bcryptjs";
import userModel from "../../models/users/userModel.js";
import { emailService } from "./emailService.js";
import { tokenService } from "./tokenService.js";
import { generateOTP, validatePassword } from "../../utils/authUtils.js";

export const authService = {
    //Register
   async register(userData) {
    const {name, email, password} = userData;

    if(!name || !email || !password) {
        throw new Error("All fields are required");
    }

    //Check user already exists
    const existingUser = await userModel.findOne({ email });
    if(existingUser) {
        throw new Error("User already exists");
    }

        // Validate password với lỗi cụ thể
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.errors.join(', '));
        }

    //Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({name, email, password: hashedPassword});
    await newUser.save();

    const token  = tokenService.createToken(newUser._id);

    await emailService.sendWelcomeEmail(email, name);

    return token

   },

   async login(credentials) {
    const {email, password} = credentials;

    const user = await userModel.findOne({email});
    if(!user) {
        throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Email or password is incorrect");
        }

        // Tạo token
        const token = tokenService.createToken(user._id);

        return token;
   },

// Send OTP verification
    async sendVerifyOTP(userId) {
        const user = await userModel.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        if (user.isAccountVerified) {
            throw new Error("Email is already verified");
        }

        const otp = generateOTP();
        const otpExpireAt = Date.now() + 10 * 60 * 1000; // 10 phút

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = otpExpireAt;
        await user.save();

        await emailService.sendVerifyOTPEmail(user.email, otp);
        return { message: "OTP has been sent to email" };
    },

    // Xác thực email
    async verifyEmail(userId, otp) {
        const user = await userModel.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        if (user.isAccountVerified) {
            throw new Error("Email is already verified");
        }

        if (user.verifyOtp !== otp) {
            throw new Error("OTP is incorrect");
        }

        if (Date.now() > user.verifyOtpExpireAt) {
            throw new Error("OTP has expired");
        }

        user.isAccountVerified = true;
        user.verifyOtp = "";
        user.verifyOtpExpireAt = 0;
        await user.save();

        return { message: "Email verification successful" };
    },

    // Gửi OTP reset password
    async sendResetOTP(email) {
        const user = await userModel.findOne({ email });
        if (!user) {
            throw new Error("Email not found");
        }

        const otp = generateOTP();
        console.log("check otp", otp);
        const otpExpireAt = Date.now() + 10 * 60 * 1000; // 10 phút

        user.resetOtp = otp;
        user.resetOtpExpireAt = otpExpireAt;
        await user.save();

        await emailService.sendResetOTPEmail(email, otp);
        return { message: "OTP reset password has been sent" };
    },

    // Reset password
    async resetPassword(email, otp, newPassword) {
        const user = await userModel.findOne({ email });
        if (!user) {
            throw new Error("Email not found");
        }

        if (user.resetOtp !== otp) {
            throw new Error("OTP is incorrect");
        }

        if (Date.now() > user.resetOtpExpireAt) {
            throw new Error("OTP has expired");
        }

        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.errors.join(', '));
        }


        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        user.resetOtp = "";
        user.resetOtpExpireAt = 0;
        await user.save();

        return { message: "Reset password successful" };
    }
};