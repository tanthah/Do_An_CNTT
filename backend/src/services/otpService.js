
import crypto from "crypto";

export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const createOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 phút
};

export const verifyOTP = (storedOTP, storedExpiry, inputOTP) => {
  if (!storedOTP || !storedExpiry) {
    return { valid: false, message: "OTP not found" };
  }

  if (new Date() > new Date(storedExpiry)) {
    return { valid: false, message: "OTP expired" };
  }

  const normalizedStoredOTP =
    typeof storedOTP === "string" ? storedOTP.trim() : String(storedOTP ?? "");
  const normalizedInputOTP =
    typeof inputOTP === "string" ? inputOTP.trim() : String(inputOTP ?? "");

  if (normalizedStoredOTP !== normalizedInputOTP) {
    return { valid: false, message: "Invalid OTP" };
  }

  return { valid: true, message: "OTP verified" };
};
