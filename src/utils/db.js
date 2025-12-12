// src/utils/db.js
import "dotenv/config"; // <--- INI KUNCINYA! Wajib ada biar dia baca .env duluan
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

// Cek dulu biar gak bingung errornya
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL ga kebaca bro! Cek file .env lo atau import dotenv nya."
  );
}

// 1. Setup Koneksi
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 2. Pasang Adapter
const adapter = new PrismaPg(pool);

// 3. Masukin Adapter ke PrismaClient
const prisma = new PrismaClient({
  adapter,
  log: ["info", "warn", "error"],
});

export default prisma;
