import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

// Get slots within a date range
router.get("/slots", authMiddleware, async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: { code: "INVALID_INPUT", message: "from and to dates are required" } });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const slots = await prisma.slot.findMany({
      where: {
        startAt: { gte: fromDate },
        endAt: { lte: toDate },
      },
      include: {
        booking: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: { startAt: "asc" },
    });

    // Mark booked or available
    const formatted = slots.map(slot => ({
      id: slot.id,
      startAt: slot.startAt,
      endAt: slot.endAt,
      booked: !!slot.booking,
      bookedBy: slot.booking ? slot.booking.user.name : null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: "SERVER_ERROR", message: "Something went wrong" } });
  }
});

export default router;
