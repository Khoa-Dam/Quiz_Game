// middleware/userAuth.js
import { tokenService } from "../services/auth/tokenService.js";

const userAuth = async (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.json({
            success: false,
            message: "Please login again"
        });
    }
    
    try {
        const decoded = tokenService.verifyToken(token);
        req.body.userId = decoded.id;
        next();
    } catch (error) {
        return res.json({
            success: false,
            message: "Invalid token, please login again"
        });
    }
};

export default userAuth;