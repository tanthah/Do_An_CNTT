
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { generateOTP, createOTPExpiry, verifyOTP } from "../services/otpService.js";
import { sendOTPEmail, sendWelcomeEmail } from "../services/emailService.js";

// Tạo JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// @desc    Đăng ký tài khoản người dùng mới
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra xem email đã được đăng ký chưa
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email đã được đăng ký",
      });
    }

    // Tạo mã OTP xác thực
    const otp = generateOTP();
    const otpExpiry = createOTPExpiry();

    // Tạo user mới (trạng thái chưa xác thực)
    const user = await User.create({
      name,
      email,
      password,
      otp,
      otpExpiry,
      isVerified: false,
    });

    // Gửi mã OTP qua email cho người dùng
    const otpEmailResult = await sendOTPEmail(email, otp, "verification");
    if (!otpEmailResult.success) {
      // Nếu gửi email thất bại, xóa user vừa tạo để tránh rác database
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: "Không thể gửi email OTP",
      });
    }

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP.",
      userId: user._id,
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({
      success: false,
      message: "Đăng ký thất bại",
      error: error.message,
    });
  }
};

// @desc    Xác thực mã OTP để kích hoạt tài khoản
// @route   POST /api/auth/verify-otp
export const verifyOTPCode = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Kiểm tra mã OTP có hợp lệ và còn hạn không
    const verification = verifyOTP(user.otp, user.otpExpiry, otp);
    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message,
      });
    }

    // Xác thực thành công: cập nhật trạng thái đã xác thực và xóa OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Gửi email chào mừng sau khi xác thực thành công
    await sendWelcomeEmail(user.email, user.name);

    // Tạo token đăng nhập ngay sau khi xác thực
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Xác thực email thành công!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Lỗi xác thực OTP:", error);
    res.status(500).json({
      success: false,
      message: "Xác thực thất bại",
      error: error.message,
    });
  }
};

// @desc    Gửi lại mã OTP nếu người dùng không nhận được hoặc mã hết hạn
// @route   POST /api/auth/resend-otp
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Nếu tài khoản đã được xác thực thì không cần gửi lại OTP xác thực nữa
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email đã được xác thực",
      });
    }

    // Tạo mã OTP mới
    const otp = generateOTP();
    const otpExpiry = createOTPExpiry();

    // Cập nhật OTP mới vào user
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Gửi lại email chứa OTP
    const resendResult = await sendOTPEmail(email, otp, "verification");
    if (!resendResult.success) {
      return res.status(500).json({
        success: false,
        message: "Không thể gửi email OTP",
      });
    }

    res.json({
      success: true,
      message: "Đã gửi lại mã OTP",
    });
  } catch (error) {
    console.error("Lỗi gửi lại OTP:", error);
    res.status(500).json({
      success: false,
      message: "Gửi lại OTP thất bại",
      error: error.message,
    });
  }
};

// @desc    Đăng nhập người dùng
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user trong database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Thông tin đăng nhập không chính xác",
      });
    }

    // Kiểm tra mật khẩu
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Thông tin đăng nhập không chính xác",
      });
    }

    // Kiểm tra xem user đã xác thực email chưa
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng xác thực email trước khi đăng nhập",
        needsVerification: true,
      });
    }

    // Tạo token xác thực cho phiên đăng nhập
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        totalChats: user.totalChats,
        vocabLearned: user.vocabLearned,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({
      success: false,
      message: "Đăng nhập thất bại",
      error: error.message,
    });
  }
};

// @desc    Lấy thông tin người dùng hiện tại (đã đăng nhập)
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    // Lấy thông tin user từ ID trong token (đã được middleware giải mã), loại bỏ trường password
    const user = await User.findById(req.user.id).select("-password");
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin người dùng",
      error: error.message,
    });
  }
};

// @desc    Quên mật khẩu (Gửi OTP để đặt lại mật khẩu)
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Tạo mã OTP cho việc reset mật khẩu
    const otp = generateOTP();
    const otpExpiry = createOTPExpiry();

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Gửi email OTP reset mật khẩu
    const forgotResult = await sendOTPEmail(email, otp, "reset");
    if (!forgotResult.success) {
      return res.status(500).json({
        success: false,
        message: "Không thể gửi email OTP",
      });
    }

    res.json({
      success: true,
      message: "Đã gửi mã OTP đến email của bạn",
    });
  } catch (error) {
    console.error("Lỗi quên mật khẩu:", error);
    res.status(500).json({
      success: false,
      message: "Thất bại trong việc gửi OTP",
      error: error.message,
    });
  }
};

// @desc    Xác thực OTP cho việc đặt lại mật khẩu
// @route   POST /api/auth/verify-reset-otp
export const verifyResetPasswordOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    const verification = verifyOTP(user.otp, user.otpExpiry, otp);
    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message,
      });
    }

    return res.json({
      success: true,
      message: "Xác thực OTP thành công",
    });
  } catch (error) {
    console.error("Lỗi xác thực OTP reset password:", error);
    return res.status(500).json({
      success: false,
      message: "Xác thực OTP thất bại",
      error: error.message,
    });
  }
};

// @desc    Đặt lại mật khẩu mới (cần OTP hợp lệ)
// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Xác thực lại OTP một lần nữa để đảm bảo an toàn
    const verification = verifyOTP(user.otp, user.otpExpiry, otp);
    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message,
      });
    }

    // Cập nhật mật khẩu mới và xóa OTP
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Đặt lại mật khẩu thành công",
    });
  } catch (error) {
    console.error("Lỗi đặt lại mật khẩu:", error);
    res.status(500).json({
      success: false,
      message: "Đặt lại mật khẩu thất bại",
      error: error.message,
    });
  }
};

// @desc    Đổi mật khẩu (dành cho người dùng đã đăng nhập)
// @route   PUT /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    // Kiểm tra mật khẩu hiện tại có đúng không
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Mật khẩu hiện tại không chính xác",
      });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    res.status(500).json({
      success: false,
      message: "Đổi mật khẩu thất bại",
      error: error.message,
    });
  }
};

// @desc    Google OAuth callback xử lý sau khi Google redirect về
// @route   GET /api/auth/google/callback
export const googleCallback = (req, res) => {
  const token = generateToken(req.user._id);

  // Redirect về frontend kèm theo token
  res.redirect(`${process.env.FRONTEND_URL}/auth/google?token=${token}`);
};
