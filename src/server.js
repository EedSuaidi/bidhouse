// src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/auth.route.js";
import itemRoutes from "./routes/item.route.js";

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Path buat baca file YAML (karena pake ES Modules agak ribet dikit)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Swagger Document
const swaggerDocument = YAML.load(path.join(__dirname, "./docs/swagger.yaml"));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send({
    message: "Welcome to BidHouse API 🚀",
    docs: `Check documentation at http://localhost:${PORT}/api-docs`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Something went wrong on the server",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`
  🚀 Server is running on port ${PORT}
  🌐 URL: http://localhost:${PORT}
  📑 Docs: http://localhost:${PORT}/api-docs
  `);
});
