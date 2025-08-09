import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: { code: "INVALID_INPUT", message: "Name, email, and password are required" } });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: { code: "DUPLICATE_EMAIL", message: "Email already registered" } });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { name, email, passwordHash, role: role || "patient" },
    });

    res.status(201).json({ id: newUser.id, email: newUser.email, role: newUser.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: "SERVER_ERROR", message: "Something went wrong" } });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } });
    }

    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "8h" });
    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: "SERVER_ERROR", message: "Something went wrong" } });
  }
});

export default router;
