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

export const validateQuizCreation = ({ title, questions }) => {
    const errors = [];
    
    if (!title || title.trim().length < 3) {
      errors.push('Quiz title must be at least 3 characters');
    }
    
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      errors.push('Quiz must have at least 1 question');
    }
    
    if (questions && questions.length > 15) {
      errors.push('Quiz cannot have more than 15 questions');
    }
    
    // Validate each question
    if (questions && Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        if (!question.text || question.text.trim().length < 5) {
          errors.push(`Question ${i + 1}: Text must be at least 5 characters`);
        }
        if (!question.options || !Array.isArray(question.options) || question.options.length !== 4) {
          errors.push(`Question ${i + 1}: Must have exactly 4 options`);
        }
        if (question.correctAnswer === undefined || question.correctAnswer < 0 || question.correctAnswer > 3) {
          errors.push(`Question ${i + 1}: Correct answer must be between 0 and 3`);
        }
      }
    }
    
    return errors;
  };