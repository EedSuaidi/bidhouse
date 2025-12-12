// src/controllers/bid.controller.js
import prisma from "../utils/db.js";
import { bidSchema } from "../utils/validators.js";

// PLACE BID
export const placeBid = async (req, res) => {
  try {
    const { id } = req.params; // UUID String
    const userId = req.user.id; // UUID String dari token

    const result = bidSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({ error: result.error.errors.map((e) => e.message) });
    }
    const { amount } = result.data;

    // Cek Barang (Pake id string)
    const item = await prisma.item.findUnique({ where: { id: id } });

    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.status !== "OPEN") {
      return res.status(400).json({ message: "This auction is closed" });
    }

    const now = new Date();
    if (now < item.startTime)
      return res.status(400).json({ message: "Auction has not started yet" });
    if (now > item.endTime)
      return res.status(400).json({ message: "Auction has ended" });

    if (amount <= Number(item.currentPrice)) {
      return res.status(400).json({
        message: `Bid must be higher than current price (${item.currentPrice})`,
      });
    }

    await prisma.$transaction([
      prisma.bid.create({
        data: {
          amount: amount,
          userId: userId,
          itemId: id, // <--- Langsung string
        },
      }),
      prisma.item.update({
        where: { id: id },
        data: { currentPrice: amount },
      }),
    ]);

    res.status(201).json({
      message: "Bid placed successfully!",
      yourBid: amount,
    });
  } catch (error) {
    console.error("Place Bid Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
