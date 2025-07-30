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

export const validateQuizCreation = ({ title, questionIds }) => {
    const errors = [];
    
    if (!title || title.trim().length < 3) {
      errors.push('Quiz title must be at least 3 characters');
    }
    
    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      errors.push('Quiz must have at least 1 question');
    }
    
    if (questionIds && questionIds.length > 15) {
      errors.push('Quiz cannot have more than 15 questions');
    }
    
    return errors;
  };