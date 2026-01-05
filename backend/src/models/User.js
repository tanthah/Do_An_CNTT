
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },
  googleId: { type: String },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ["user", "admin"], default: "user" },

  // Thống kê học tập
  totalChats: { type: Number, default: 0 },
  vocabLearned: { type: Number, default: 0 },
  feedbackCount: { type: Number, default: 0 }, // Số lần gửi feedback
  isActive: { type: Boolean, default: true }, // Khóa/mở khóa tài khoản

  // OTP
  otp: { type: String },
  otpExpiry: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password trước khi lưu
userSchema.pre("save", async function () {
  this.updatedAt = Date.now();

  if (!this.isModified("password") || !this.password) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// So sánh password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
