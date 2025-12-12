import express from "express";
import {
  createItem,
  getAllItems,
  getItemById,
  deleteItem,
  closeAuction,
} from "../controllers/item.controller.js";
import { placeBid } from "../controllers/bid.controller.js";
import {
  authenticate,
  authorizeAdmin,
} from "../middlewares/auth.middleware.js";
import upload from "../utils/upload.js";

const router = express.Router();

// Public
router.get("/", getAllItems);
router.get("/:id", getItemById);

// Authenticated User (Bisa Nawar)
router.post("/:id/bid", authenticate, placeBid); // <--- User nge-bid di sini

// Admin Only
router.post(
  "/",
  authenticate,
  authorizeAdmin,
  upload.single("image"),
  createItem
);
router.delete("/:id", authenticate, authorizeAdmin, deleteItem);
router.post("/:id/close", authenticate, authorizeAdmin, closeAuction); // <--- Admin nutup lelang

export default router;
