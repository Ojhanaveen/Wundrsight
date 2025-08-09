import request from "supertest";
import app from "../server.js"; // Your Express app export
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let token;
let bookingId;
let testSlotId;

beforeAll(async () => {
  // Ensure a patient exists for testing
  await prisma.user.upsert({
    where: { email: "apitest@example.com" },
    update: {},
    create: {
      name: "API Test User",
      email: "apitest@example.com",
      passwordHash: "$2a$10$Z3FjK3t/ZiXv4BzRk5yVQOe2nMYZcTjM7X75eBwxK0aPG2qWfgh4K", // bcrypt hash for "Test@123"
      role: "patient"
    }
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("API Endpoints", () => {
  test("Login returns token", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ email: "apitest@example.com", password: "Test@123" });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test("Get slots works", async () => {
    const today = new Date().toISOString().split("T")[0];
    const toDay = new Date();
    toDay.setDate(new Date().getDate() + 1);
    const toStr = toDay.toISOString().split("T")[0];

    const res = await request(app)
      .get(`/api/slots?from=${today}&to=${toStr}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    testSlotId = res.body.find(s => !s.booked)?.id; // pick first free slot
  });

  test("Book a slot works", async () => {
    const res = await request(app)
      .post("/api/book")
      .set("Authorization", `Bearer ${token}`)
      .send({ slotId: testSlotId });

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
    bookingId = res.body.id;
  });

  test("Booking same slot again returns SLOT_TAKEN", async () => {
    const res = await request(app)
      .post("/api/book")
      .set("Authorization", `Bearer ${token}`)
      .send({ slotId: testSlotId });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe("SLOT_TAKEN");
  });

  test("Cancel booking works", async () => {
    const res = await request(app)
      .delete(`/api/booking/${bookingId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Booking cancelled successfully");
  });
});
