
import nodemailer from "nodemailer";

let transporter = null;
let initialized = false;

export const getTransporter = () => {
  if (initialized) return transporter;
  initialized = true;

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;

  if (emailUser && emailPass) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    transporter.verify((error) => {
      if (error) {
        console.error(" Email config error:", error.message);
      } else {
        console.log(" Email server ready");
      }
    });
  } else {
    console.log(" Email credentials not configured - Email features disabled");
  }

  return transporter;
};

export { transporter };
