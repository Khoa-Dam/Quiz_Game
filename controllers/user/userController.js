import path from "path";
import userModel from "../../models/users/userModel.js";

export const getUserData = async (req, res) => {

    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        return res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified,
                profilePicture: user.profilePicture || "",
                email: user.email,
            }
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const { userId, name } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (name) {
            user.name = name;
        }

        if (req.file) {
            // Store relative path for serving statically
            const relativePath = path.join("/uploads", req.file.filename).replace(/\\/g, "/");
            user.profilePicture = relativePath;
        }

        await user.save();

        return res.json({
            success: true,
            message: "Profile updated successfully",
            userData: {
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture || "",
                isAccountVerified: user.isAccountVerified,
            }
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export default getUserData;