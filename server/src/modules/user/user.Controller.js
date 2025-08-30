import { User } from "../../models/index.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const getUserData = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    return res.json({
      success: true,
      userData: {
        name: user.name,
        isAccountVerified: user.isAccountVerified,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const updateUserData = async (req, res) => {
  try {
    const { userId, name } = req.body;
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (name) {
      user.name = name;
    }

    if (profilePicture) {
      // Delete old profile picture if it exists
      if (user.profilePicture && user.profilePicture.startsWith("/uploads/")) {
        const oldImagePath = path.join(process.cwd(), user.profilePicture);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      user.profilePicture = profilePicture;
    }

    await user.save();

    return res.json({
      success: true,
      message: "User data updated successfully",
      userData: {
        name: user.name,
        isAccountVerified: user.isAccountVerified,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export { getUserData, updateUserData, upload };
