// src/middlewares/auth.middleware.js
import "dotenv/config";
import jwt from "jsonwebtoken";

// 1. Cek Token (Apakah user login?)
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Unauthorized. Please login first." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Simpen data user (id, role) ke request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// 2. Cek Admin (Apakah role-nya ADMIN?)
export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "Forbidden. Admin access required." });
  }
  next();
};
