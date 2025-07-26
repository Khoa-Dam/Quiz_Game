// utils/authUtils.js
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate password
export const validatePassword = (password) => {
    const errors = [];
    
    if (!password) {
        errors.push("Password is required");
        return { isValid: false, errors };
    }
    
    if (password.length < 8) {
        errors.push("Password must be at least 8 characters");
    }
    
    if (!/[a-z]/.test(password)) {
        errors.push("Password must be at least 1 lowercase letter");
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push("Password must be at least 1 uppercase letter");
    }
    
    if (!/\d/.test(password)) {
        errors.push("Password must be at least 1 number");
    }
    
    if (!/[@$!%*?&]/.test(password)) {
        errors.push("Password must be at least 1 special character (@$!%*?&)");
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateOTP = (otp) => {
    return /^\d{6}$/.test(otp);
};