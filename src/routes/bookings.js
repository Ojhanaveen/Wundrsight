import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, requireRole } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

// Book a slot (Patient)
router.post("/book", authMiddleware, requireRole("patient"), async (req, res) => {
  try {
    const { slotId } = req.body;
    if (!slotId) {
      return res.status(400).json({ error: { code: "INVALID_INPUT", message: "slotId is required" } });
    }

    try {
      const booking = await prisma.booking.create({
        data: {
          slotId,
          userId: req.user.sub,
        },
      });
      res.status(201).json(booking);
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(400).json({ error: { code: "SLOT_TAKEN", message: "Slot already booked" } });
      }
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: "SERVER_ERROR", message: "Something went wrong" } });
  }
});

// Patient - My bookings
router.get("/my-bookings", authMiddleware, requireRole("patient"), async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.sub },
      include: { slot: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: "SERVER_ERROR", message: "Something went wrong" } });
  }
});

// Admin - All bookings
router.get("/all-bookings", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        slot: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: "SERVER_ERROR", message: "Something went wrong" } });
  }
});

// Cancel a booking (Patient)
router.delete("/:id", authMiddleware, requireRole("patient"), async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
    });

    if (!booking) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Booking not found" } });
    }

    if (booking.userId !== req.user.sub) {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: "You are not allowed to cancel this booking" } });
    }

    await prisma.booking.delete({ where: { id: req.params.id } });

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: "SERVER_ERROR", message: "Something went wrong" } });
  }
});

export default router;
