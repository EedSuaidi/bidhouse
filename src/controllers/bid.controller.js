// src/controllers/bid.controller.js
import prisma from "../utils/db.js";
import { bidSchema } from "../utils/validators.js";

// PLACE BID (User Only)
export const placeBid = async (req, res) => {
  try {
    const { id } = req.params; // Item ID dari URL
    const userId = req.user.id; // Dari token (middleware)

    // 1. Validasi Input Amount
    const result = bidSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({ error: result.error.errors.map((e) => e.message) });
    }
    const { amount } = result.data;

    // 2. Cek Barang Valid Gak?
    const item = await prisma.item.findUnique({ where: { id: parseInt(id) } });

    if (!item) return res.status(404).json({ message: "Item not found" });

    // 3. Validasi Aturan Lelang
    // A. Barang harus OPEN
    if (item.status !== "OPEN") {
      return res.status(400).json({ message: "This auction is closed" });
    }

    // B. Waktu harus pas (Gak boleh kecepetan atau telat)
    const now = new Date();
    if (now < item.startTime) {
      return res.status(400).json({ message: "Auction has not started yet" });
    }
    if (now > item.endTime) {
      return res.status(400).json({ message: "Auction has ended" });
    }

    // C. Harga Bid harus LEBIH TINGGI dari harga sekarang
    // Note: Prisma pake Decimal, jadi konversi ke Number buat compare
    if (amount <= Number(item.currentPrice)) {
      return res.status(400).json({
        message: `Bid must be higher than current price (${item.currentPrice})`,
      });
    }

    // 4. EKSEKUSI (Transaction)
    // Create Bid + Update Item Current Price sekaligus
    await prisma.$transaction([
      // A. Catet siapa yg nge-bid
      prisma.bid.create({
        data: {
          amount: amount,
          userId: userId,
          itemId: parseInt(id),
        },
      }),
      // B. Update harga barang jadi harga terbaru
      prisma.item.update({
        where: { id: parseInt(id) },
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
