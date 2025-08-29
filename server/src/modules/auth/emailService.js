// services/emailService.js
import transporter from "../../config/nodemailer.js";

export const emailService = {
    async sendWelcomeEmail(email, name) {
        const mailOptions = {
            from: process.env.SENDER_MAIL,
            to: email,
            subject: "Welcome to Quiz Game",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">🎉 Welcome to Quiz Game!</h2>
                    <p>Hello <strong>${name}</strong>,</p>
                    <p>Thank you for registering. Now you can:</p>
                    <ul>
                        <li>✅ Create your own question bank</li>
                        <li>✅ Join game rooms</li>
                        <li>🏆 View the ranking</li>
                        <li>✉️ Invite friends to play</li>
                    </ul>
                    <p>Chúc bạn có những trải nghiệm thú vị!</p>
                    <p>Thank you,<br><strong>Quiz Game Team</strong></p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
    },

    async sendVerifyOTPEmail(email, otp) {
        const mailOptions = {
            from: process.env.SENDER_MAIL,
            to: email,
            subject: "Email Verification - Quiz Game",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">✉️ Email Verification</h2>
                    <p>Your verification code is:</p>
                    <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px;">
                        <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
                    </div>
                    <p><strong>Note:</strong> This code will expire in 10 minutes.</p>
                    <p>If you did not request this code, please ignore this email.</p>
                    <p>Thank you,<br><strong>Quiz Game Team</strong></p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
    },

    async sendResetOTPEmail(email, otp) {
        const mailOptions = {
            from: process.env.SENDER_MAIL,
            to: email,
            subject: "Reset Password - Quiz Game",
            html: `
             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">✉️ Reset Password</h2>
                    <p>Your reset code is:</p>
                    <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px;">
                        <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
                    </div>
                    <p><strong>Note:</strong> This code will expire in 10 minutes.</p>
                    <p>If you did not request this code, please ignore this email.</p>
                    <p>Thank you,<br><strong>Quiz Game Team</strong></p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
    }
};