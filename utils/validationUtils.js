import { validateEmail, validatePassword, validateOTP } from "./authUtils.js";

export const validateRegistration = (data) => {
    const errors = [];
    const { name, email, password } = data;

    if (!name || name.trim().length < 2) {
        errors.push("Name must be at least 2 characters");
    }

    if (!email || !validateEmail(email)) {
        errors.push("Email is not valid");
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
    }

    return errors;
};

export const validateLogin = (data) => {
    const errors = [];
    const { email, password } = data;

    if (!email || !validateEmail(email)) {
        errors.push("Email is not valid");
    }

    if (!password) {
        errors.push("Password is required");
    }

    return errors;
};

export const validateOTPRequest = (data) => {
    const errors = [];
    const { otp } = data;

    if (!otp || !validateOTP(otp)) {
        errors.push("OTP must be 6 digits");
    }

    return errors;
};

export const validatePasswordOnly = (password) => {
    const passwordValidation = validatePassword(password);
    return passwordValidation.errors;
};