import "dotenv/config";
import nodemailer from "nodemailer";

// Cek dulu biar gak error aneh kayak "Missing credentials"
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  throw new Error(
    "⚠️ SMTP Credentials belum diset di .env! Cek SMTP_USER dan SMTP_PASS lo."
  );
}

// Setup Transporter (Si Tukang Pos)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Fungsi Kirim Email Verifikasi
export const sendVerificationEmail = async (email, token) => {
  const baseURL = process.env.BASE_URL || "http://localhost:3000";
  const verificationUrl = `${baseURL}/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: '"BidHouse Admin" <no-reply@bidhouse.com>',
    to: email,
    subject: "Verify Your Email - BidHouse",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #333;">Welcome to BidHouse! 🚀</h2>
        <p>Thanks for registering. Please click the button below to verify your email address:</p>
        <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
        <p style="margin-top: 20px; font-size: 12px; color: #888;">Or copy this link: <br> ${verificationUrl}</p>
        <p>This link will verify your account instantly.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};
