// frontend/src/services/authService.js
import api from "./api";

export const register = (userData) => {
  return api.post("/auth/register", userData);
};

export const verifyOTP = (otpData) => {
  return api.post("/auth/verify-otp", otpData);
};

export const resendOTP = (email) => {
  return api.post("/auth/resend-otp", { email });
};

export const login = (credentials) => {
  return api.post("/auth/login", credentials);
};

export const getMe = () => {
  return api.get("/auth/me");
};

export const forgotPassword = (email) => {
  return api.post("/auth/forgot-password", { email });
};

export const verifyResetOTP = (data) => {
  return api.post("/auth/verify-reset-otp", data);
};

export const resetPassword = (data) => {
  return api.post("/auth/reset-password", data);
};

export const changePassword = (passwords) => {
  return api.put("/auth/change-password", passwords);
};

export const googleLogin = () => {
  window.location.href = `${api.defaults.baseURL}/auth/google`;
};
