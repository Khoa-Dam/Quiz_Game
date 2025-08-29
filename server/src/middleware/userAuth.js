// middleware/userAuth.js
import { tokenService } from "../modules/auth/tokenService.js";

const userAuth = async (req, res, next) => {
    // ✅ Hỗ trợ cả cookie và Authorization header
    let token = req.cookies.token;

    // Nếu không có cookie, kiểm tra Authorization header
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Bỏ "Bearer " prefix
        }
    }

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
        console.error('Token verification error:', error);
        return res.json({
            success: false,
            message: "Invalid token, please login again"
        });
    }
};

export default userAuth;