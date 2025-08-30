import bcrypt from "bcryptjs";
import { User } from "../../models/index.js";
import { emailService } from "./email.Service.js";
import { tokenService } from "./token.Service.js";
import { generateOTP, validatePassword } from "../../utils/authUtils.js";

export const authService = {
    //Register
    async register(userData) {
        const { name, email, password } = userData;

        if (!name || !email || !password) {
            throw new Error("All fields are required");
        }

        //Check user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error("User already exists");
        }

        // Validate password với lỗi cụ thể
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.errors.join(', '));
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        const token = tokenService.createToken(newUser._id);

        await emailService.sendWelcomeEmail(email, name);

        return token

    },

    async login(credentials) {
        const { email, password } = credentials;

        const user = await User.findOne({ email });
        if (!user) {
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
        const user = await User.findById(userId);
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
        const user = await User.findById(userId);
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
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("Email not found");
        }

        const otp = generateOTP();
        const otpExpireAt = Date.now() + 10 * 60 * 1000; // 10 phút

        user.resetOtp = otp;
        user.resetOtpExpireAt = otpExpireAt;
        await user.save();

        await emailService.sendResetOTPEmail(email, otp);
        return { message: "OTP reset password has been sent" };
    },

    // Reset password
    async resetPassword(email, otp, newPassword) {
        const user = await User.findOne({ email });
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
    },

    async findOrCreateGoogleUser(profile) {
        // profile: { googleId, email, name, avatar, emailVerified }
        if (!profile?.googleId || !profile?.email) {
            throw new Error("Invalid Google profile");
        }

        // 1) Ưu tiên theo googleId
        let user = await User.findOne({ googleId: profile.googleId });

        // 2) Fallback theo email (nên chỉ link nếu emailVerified=true)
        if (!user) {
            user = await User.findOne({ email: profile.email });
        }

        if (user) {
            // LINK Google nếu chưa có
            if (!user.googleId) user.googleId = profile.googleId;

            // Nếu user chưa có password (tạo từ Google), provider là GOOGLE cho rõ ràng
            if (!user.password) user.provider = "GOOGLE";

            if (!user.name && profile.name) user.name = profile.name;
            if (!user.avatar && profile.avatar) user.avatar = profile.avatar;

            // Map email_verified → isAccountVerified (không hạ thấp nếu true rồi)
            user.isAccountVerified = user.isAccountVerified || !!profile.emailVerified;

            await user.save();
            return user;
        }

        // 3) Không có user nào → tạo mới theo Google
        return await User.create({
            name: profile.name || profile.email.split("@")[0],
            email: profile.email,
            provider: "GOOGLE",
            googleId: profile.googleId,
            avatar: profile.avatar || null,
            isAccountVerified: !!profile.emailVerified,
            // password: null (mặc định)
        });
    },
};