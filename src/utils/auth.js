import "dotenv/config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Cek dulu kuncinya ada gak
if (!process.env.JWT_SECRET) {
  throw new Error("⚠️ JWT_SECRET belum diset di .env! Isi dulu bro.");
}

// 1. Fungsi Hash Password
export const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// 2. Fungsi Cek Password
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// 3. Fungsi Bikin Token JWT
export const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};
