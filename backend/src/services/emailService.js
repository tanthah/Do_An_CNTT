
import { getTransporter } from "../config/email.js";

export const sendOTPEmail = async (email, otp, purpose = "verification") => {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.warn("Email not configured - OTP email skipped");
      return { success: false, error: "Email not configured" };
    }

    const purposeLabel = purpose === "reset" ? "reset password" : "verification";
    const year = new Date().getFullYear();

    const htmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>OTP Code</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;line-height:1.6;">
    <div style="max-width:600px;margin:0 auto;padding:20px;">
      <div style="background:#4A90E2;color:#ffffff;padding:18px 20px;text-align:center;border-radius:12px 12px 0 0;">
        <div style="font-size:18px;font-weight:700;letter-spacing:0.2px;">English Learning App</div>
      </div>

      <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:0;padding:22px 20px;border-radius:0 0 12px 12px;">
        <div style="text-align:center;">
          <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:6px;">Your OTP Code</div>
          <div style="color:#6b7280;font-size:14px;margin-bottom:18px;">
            Use this code to complete ${purposeLabel}.
          </div>
        </div>

        <div style="background:#f9fafb;border:2px dashed #4A90E2;border-radius:12px;padding:16px;text-align:center;margin:16px 0;">
          <div style="font-size:34px;font-weight:800;color:#4A90E2;letter-spacing:8px;line-height:1.2;">${otp}</div>
        </div>

        <div style="color:#374151;font-size:14px;">
          <div style="margin-bottom:8px;">This code will expire in <strong>10 minutes</strong>.</div>
          <div>If you didn't request this code, please ignore this email.</div>
        </div>

        <div style="border-top:1px solid #e5e7eb;margin:18px 0;"></div>

        <div style="text-align:center;color:#6b7280;font-size:12px;">
          English Learning App - Learn English with AI<br />
          © ${year} All rights reserved.
        </div>
      </div>
    </div>
  </body>
</html>`;

    const textContent = `English Learning App\n\nYour OTP code for ${purposeLabel}: ${otp}\n\nThis code will expire in 10 minutes.\nIf you didn't request this code, please ignore this email.\n\n© ${year} English Learning App`;

    const subjects = {
      verification: "Verify Your Email - English Learning App",
      reset: "Reset Your Password - English Learning App",
      change: "Change Password Confirmation",
    };

    await transporter.sendMail({
      from: `"English Learning App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subjects[purpose] || subjects.verification,
      html: htmlContent,
      text: textContent,
    });

    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: error.message };
  }
};

export const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.warn("Email not configured - Welcome email skipped");
      return { success: true };
    }

    // ... phần còn lại của code email chào mừng
  } catch (error) {
    console.error("Welcome email error:", error);
    return { success: false, error: error.message };
  }
};
