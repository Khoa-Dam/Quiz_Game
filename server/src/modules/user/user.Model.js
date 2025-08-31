import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // ← Thay đổi: required: false
  provider: { type: String, enum: ["LOCAL", "GOOGLE"], default: "LOCAL" }, // ← Thêm
  googleId: { type: String, sparse: true }, // ← Thêm
  verifyOtp: { type: String, default: "" },
  verifyOtpExpireAt: { type: Number, default: 0 },
  isAccountVerified: { type: Boolean, default: false },
  resetOtp: { type: String, default: "" },
  resetOtpExpireAt: { type: Number, default: 0 },
  profilePicture: { type: String, default: "" },
  avatar: { type: String, default: "" }, // ← Thêm
}, {
  timestamps: true
});

// Compound index for googleId + provider
userSchema.index({ googleId: 1, provider: 1 });

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;
