// src/utils/validators.js
import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" }),
  email: z.string().email({ message: "Invalid email address format" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address format" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const itemSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  startPrice: z.number().positive(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

// --- BARU: Schema buat nge-Bid ---
export const bidSchema = z.object({
  amount: z
    .number()
    .positive({ message: "Bid amount must be a positive number" }),
});
