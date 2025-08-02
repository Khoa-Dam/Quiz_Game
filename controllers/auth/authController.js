// controllers/authController.js
import userModel from "../../models/users/userModel.js";
import { authService } from "../../services/auth/authService.js";
import { tokenService } from "../../services/auth/tokenService.js";
import { validateRegistration, validateLogin, validateOTPRequest } from "../../utils/validationUtils.js";

export const register = async (req, res) => {
    console.log("check req.body", req.body);
    try {
        const { name, email, password } = req.body;

        console.log("check name,email,password", name, email, password);
        // Validation
        const validationErrors = validateRegistration({ name, email, password });
        if (validationErrors.length > 0) {
            return res.json({
                success: false,
                message: validationErrors.join(', ')
            });
        }

        // Service call
        const result = await authService.register({ name, email, password });
        
        // Set cookie
        tokenService.setCookie(res, result);

        return res.json({
            success: true,
            message: "Registration successful",
        });

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        const validationErrors = validateLogin({ email, password });
        if (validationErrors.length > 0) {
            return res.json({
                success: false,
                message: validationErrors.join(', ')
            });
        }

        // Service call
        const result = await authService.login({ email, password });
        
        // Set cookie
        tokenService.setCookie(res, result);

        return res.json({
            success: true,
            message: "Login successful",
        });

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};

export const logout = async (req, res) => {
    try {
        tokenService.clearCookie(res);
        return res.json({
            success: true,
            message: "Logout successful"
        });
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};

export const sendVerifyOtp = async (req, res) => {
    try {
        const { userId } = req.body;
        const result = await authService.sendVerifyOTP(userId);
        
        return res.json({
            success: true,
            message: result.message
        });

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        if (!otp) {
            return res.json({
                success: false,
                message: "OTP is required"
            });
        }

        const validationErrors = validateOTPRequest({ otp });
        if (validationErrors.length > 0) {
            return res.json({
                success: false,
                message: validationErrors.join(', ')
            });
        }

        const result = await authService.verifyEmail(userId, otp);
        
        return res.json({
            success: true,
            message: result.message
        });

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};

export const sendResetOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({
                success: false,
                message: "Email is required"
            });
        }

        const result = await authService.sendResetOTP(email);
        
        return res.json({
            success: true,
            message: result.message
        });

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.json({
                success: false,
                message: "Email, OTP and new password are required"
            });
        }

        const validationErrors = [
            ...validateLogin({ email, password: newPassword }),
            ...validateOTPRequest({ otp })
        ];

        if (validationErrors.length > 0) {
            return res.json({
                success: false,
                message: validationErrors.join(', ')
            });
        }

        const result = await authService.resetPassword(email, otp, newPassword);
        
        return res.json({
            success: true,
            message: result.message
        });

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};

export const isAuthenticated = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId).select('-password');
        return res.json({
            success: true,
            message: "User verified",
        });
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};