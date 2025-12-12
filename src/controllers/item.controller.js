import prisma from "../utils/db.js";
import { itemSchema } from "../utils/validators.js";

// 1. CREATE ITEM (Admin)
export const createItem = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Image is required" });

    const body = { ...req.body, startPrice: parseFloat(req.body.startPrice) };
    const result = itemSchema.safeParse(body);

    if (!result.success) {
      return res
        .status(400)
        .json({ error: result.error.errors.map((e) => e.message) });
    }

    const { name, description, startPrice, startTime, endTime } = result.data;

    const newItem = await prisma.item.create({
      data: {
        name,
        description,
        startPrice,
        currentPrice: startPrice,
        imageUrl: req.file.path,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: "OPEN",
      },
    });

    res
      .status(201)
      .json({ message: "Item created successfully", data: newItem });
  } catch (error) {
    console.error("Create Item Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 2. GET ALL ITEMS
export const getAllItems = async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};

    const items = await prisma.item.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ data: items });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 3. GET ITEM BY ID
export const getItemById = async (req, res) => {
  try {
    const { id } = req.params; // UUID udah string, JANGAN diparseInt
    const item = await prisma.item.findUnique({
      where: { id: id }, // <--- Langsung pake id string
      include: {
        winner: { select: { name: true, email: true } },
        bids: {
          orderBy: { amount: "desc" },
          take: 5,
          include: { user: { select: { name: true } } },
        },
      },
    });

    if (!item) return res.status(404).json({ message: "Item not found" });
    res.status(200).json({ data: item });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 4. DELETE ITEM
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.item.delete({ where: { id: id } }); // <--- Langsung pake id string
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 5. CLOSE AUCTION
export const closeAuction = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.item.findUnique({
      where: { id: id }, // <--- Langsung pake id string
      include: {
        bids: { orderBy: { amount: "desc" }, take: 1 },
      },
    });

    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.status === "CLOSED")
      return res.status(400).json({ message: "Auction is already closed" });

    const highestBid = item.bids[0];
    const winnerId = highestBid ? highestBid.userId : null;

    const updatedItem = await prisma.item.update({
      where: { id: id },
      data: { status: "CLOSED", winnerId: winnerId },
    });

    res.status(200).json({
      message: "Auction closed successfully",
      winnerId: winnerId ? winnerId : "No Bids",
      finalPrice: updatedItem.currentPrice,
    });
  } catch (error) {
    console.error("Close Auction Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
