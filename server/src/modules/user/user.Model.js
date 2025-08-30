import mongoose from "mongoose";

const PROVIDERS = ["LOCAL", "GOOGLE"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 100 },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 191,
      index: true,
    },

    // Nhà cung cấp đăng nhập hiện tại/chính (tuỳ bạn dùng để hiển thị)
    provider: {
      type: String,
      enum: PROVIDERS,
      default: "LOCAL",
      index: true,
    },

    // Liên kết Google (để map lần sau)
    googleId: {
      type: String,
      default: null,
      unique: true,
      sparse: true, // cho phép nhiều bản ghi null
    },

    // Mật khẩu chỉ bắt buộc khi provider = LOCAL
    password: {
      type: String,
      default: null,
      select: false, // nhớ .select('+password') khi login local
      required: function () {
        return this.provider === "LOCAL";
      },
    },

    // Ảnh đại diện (nếu muốn lấy từ Google payload.picture)
    avatar: { type: String, default: null },

    // Trạng thái xác minh email (map từ email_verified của Google)
    isAccountVerified: { type: Boolean, default: false },

    // OTP/Reset (nếu app của bạn dùng cho verify/reset qua email)
    verifyOtp: { type: String, default: "" },
    verifyOtpExpireAt: { type: Number, default: 0 },
    resetOtp: { type: String, default: "" },
    resetOtpExpireAt: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Nếu cần thêm index tổng hợp:
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

const User =
  mongoose.models.User || mongoose.model("User", userSchema);

export default User;
