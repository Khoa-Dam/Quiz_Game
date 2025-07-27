import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";


export const register = async (req, res) => {
    const {name, email, password} = req.body;

    if(!name || !email || !password) {
        return res.json({success: false, message: "All fields are required"});
    }

    try {

        const user = await userModel.findOne({email});
        if(user) {
            return res.json({success: false, message: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new userModel({name, email, password: hashedPassword});
        await newUser.save();

        const token = jwt.sign(
            {id: newUser._id}, 
            process.env.JWT_SECRET, 
            {expiresIn: "7d"}
        );
        res.cookie("token", token, {
            httpOnly: true, secure: process.env.NODE_ENV === "production", 
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", 
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const mailOptions = {
            from: process.env.SENDER_MAIL,
            to: email,
            subject: "Welcome to our app",
            text: `Welcome to our app ${email}`,
            html: `<p>Welcome to our app ${email}</p>`
        }

        await transporter.sendMail(mailOptions);
        return res.json({success: true, message: "Registration successful"});

    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body;

    if(!email || !password) {
        return res.json({success: false, message: "All fields are required"});
    }

    try {
         const user = await userModel.findOne({email});
        if(!user) {
            return res.json({success: false, message: "Invalid email or password"});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.json({success: false, message: "Invalid password"});
        }

        const token = jwt.sign({
            id:user._id,
        },
            process.env.JWT_SECRET,
            {expiresIn: "7d"}
        );

        res.cookie("token", token, {
            httpOnly: true, secure: process.env.NODE_ENV === "production", 
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", 
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({success: true, message: "Login successful"});
    } catch (error) {
        res.json({success: false, message: error.message});
        
    }
}

export const logout = async (req, res) => {
    
    try {
        res.clearCookie("token", {
            httpOnly: true, secure: process.env.NODE_ENV === "production", 
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", 
            maxAge: 0
        });

        return res.json({success: true, message: "Logout successful"});
    } catch (error) {
        res.json({success: false, message: error.message});
        
    }
}

export const sendVerifyOtp = async (req,res) => {

    try {
        const {userId} = req.body;
        const user = await userModel.findById(userId);
        if(user.accountVerified) {
            return res.json({success: false, message: "Account already verified"});
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpire = Date.now() + 24*60*60*1000;
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_MAIL,
            to: user.email,
            subject: "Verify your account",
            text: `Your verification OTP is ${otp}`,
            html: `<p>Your verification OTP is ${otp}</p>`
        }

        await transporter.sendMail(mailOptions);
        return res.json({success: true, message: "OTP sent to your email"});
    } catch (error) {
        res.json({success: false, message: error.message});
        
    }
}

export const verifyEmail = async (req,res) => {
    const {userId, otp} = req.body;
    if(!userId || !otp) {
        return res.json({success: false, message: "Missing details"});
    }
    try {
       const user = await userModel.findById(userId);
       if(!user) {
        return res.json({success: false, message: "User not found"});
       }

       if(user.verifyOtp === "" || user.verifyOtp !== otp) {
        return res.json({success: false, message: "Invalid OTP"});
       }

       if(user.verifyOtpExpire < Date.now()) {
        return res.json({success: false, message: "OTP Expired"});
       }
       
       user.accountVerified = true;
       user.verifyOtp = "";
       user.verifyOtpExpire = 0;

       await user.save();
       return res.json({success: true, message: "Account verified successfully"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}


//check if user is authenticated
export const isAuthenticated = async (req,res) => {
    try {
       return res.json({success: true, message: "User is authenticated"});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

//send Password Reset OTP
export const sendResetOtp = async (req,res) => {

    const {email} = req.body;

    try {
        const user = await userModel.findOne({email});
        if(!user) {
            return res.json({success: false, message: "User not found"});
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 24*60*60*1000;
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_MAIL,
            to: email,
            subject: "Reset your password",
            text: `Your reset OTP is ${otp}`,
        }

        await transporter.sendMail(mailOptions);
        return res.json({success: true, message: "Reset OTP sent to your email"});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}


//Reset Password
export const resetPassword = async(req, res) =>{
    const {email, otp, newPassword} = req.body;
    if(!email || !otp || !newPassword) {
        return res.json({success: false, message: "Email, OTP and new password fields are required"});
    }

    try {
        const user = await userModel.findOne({email});
        if(!user) {
            return res.json({success: false, message: "User not found"});
        }

         if(user.resetOtp !== otp || user.resetOtpExpireAt === "") {
            return res.json({success: false, message: "Invalid OTP"});
         }

         if(user.resetOtpExpireAt < Date.now()) {
            return res.json({success: false, message: "OTP Expired"});
         }

         const hashedPassword = await bcrypt.hash(newPassword, 10);
         user.password = hashedPassword;
         user.resetOtp = "";
         user.resetOtpExpireAt = 0;

         await user.save();
         return res.json({success: true, message: "Password reset successfully"});

    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}


//Github Auth
export const githubAuth = async (req, res) => {
    const redirectUri = process.env.GITHUB_REDIRECT_URI;
    const clientId = process.env.GITHUB_CLIENT_ID;

    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
    
    res.redirect(url);
}

export const githubCallback = async (req, res) => {
    const code = req.query.code;

        const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code
        },
             {
            headers: {
                'Accept': 'application/json'
                }
            }
    );

    const accessToken = tokenRes.data.access_token;
    const userRes = await axios.get('https://api.github.com/user', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    const emailRes = await axios.get('https://api.github.com/user/emails', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    const email = emailRes.data.find(e => e.primary  && e.verified)?.email;

    console.log("github user data", {
        user: userRes.data.name,
        email
    })
    
    res.redirect(`http://localhost:3000/success`);
}