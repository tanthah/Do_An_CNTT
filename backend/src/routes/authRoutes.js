import express from "express";
import passport from "passport";
import {
  register,
  verifyOTPCode,
  resendOTP,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  googleCallback,
  verifyResetPasswordOTP,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import {
  registerValidation,
  loginValidation,
  otpValidation,
  changePasswordValidation,
  validateRequest,
} from "../middleware/validator.js";

const router = express.Router();

import { upload } from "../middleware/upload.js";

// Các route công khai
router.post("/register", registerValidation, validateRequest, register);
router.post("/verify-otp", otpValidation, validateRequest, verifyOTPCode);
router.post("/resend-otp", resendOTP);
router.post("/login", loginValidation, validateRequest, login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", otpValidation, validateRequest, verifyResetPasswordOTP);
router.post("/reset-password", resetPassword);

// Xác thực Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account consent",
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login`,
  }),
  googleCallback
);

// Các route được bảo vệ
router.get("/me", protect, getMe);
router.put(
  "/change-password",
  protect,
  changePasswordValidation,
  validateRequest,
  changePassword
);

export default router;
