import crypto from "crypto";
import { registerSchema, loginSchema } from "../utils/validators.js";
import { hashPassword, comparePassword, generateToken } from "../utils/auth.js";
import { sendVerificationEmail } from "../utils/email.js";
import prisma from "../utils/db.js";

// REGISTER USER
export const register = async (req, res) => {
  try {
    // 1. Validate Input
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: result.error.errors.map((e) => e.message),
      });
    }

    const { name, email, password } = result.data;

    // 2. Cek apakah user udah ada?
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // --- LOGIC BARU DI SINI ---
    if (existingUser) {
      // Skenario A: User udah ada DAN udah verifikasi -> Tolak
      if (existingUser.isVerified) {
        return res.status(400).json({ message: "Email is already registered" });
      }

      // Skenario B: User ada TAPI belum verifikasi (Akun Nyangkut) -> TIMPA DATA LAMA
      // Kita update password & nama baru, terus kirim token baru.
      const hashedPassword = await hashPassword(password);
      const verificationToken = crypto.randomBytes(32).toString("hex");

      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          name,
          password: hashedPassword,
          verificationToken,
          // Reset status verification (sebenernya udah false, tapi biar pasti aja)
          isVerified: false,
        },
      });

      // Kirim Email Verifikasi Ulang
      await sendVerificationEmail(updatedUser.email, verificationToken);

      return res.status(200).json({
        message:
          "Registration updated. We have resent the verification email. Please check your inbox.",
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
        },
      });
    }
    // --------------------------

    // Skenario C: User beneran baru (Belum ada di DB) -> Buat Baru
    const hashedPassword = await hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken,
        isVerified: false,
      },
    });

    await sendVerificationEmail(newUser.email, verificationToken);

    res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Invalid or missing token" });
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    res.send(`
      <div style="text-align: center; padding: 50px; font-family: Arial;">
        <h1 style="color: green;">Email Verified Successfully! ✅</h1>
        <p>Your account is now active. You can close this window and login to BidHouse.</p>
      </div>
    `);
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// LOGIN USER
export const login = async (req, res) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: result.error.errors.map((e) => e.message),
      });
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message:
          "Please verify your email address before logging in. Check your inbox.",
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
