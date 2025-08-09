import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing old data...");
  await prisma.booking.deleteMany();
  await prisma.slot.deleteMany();

  console.log("Seeding database...");

  // Create Admin
  const adminEmail = "admin@example.com";
  const adminPass = "Passw0rd!";
  const adminHash = await bcrypt.hash(adminPass, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin User",
      email: adminEmail,
      passwordHash: adminHash,
      role: "admin",
    },
  });

  // Create Patient
  const patientEmail = "patient@example.com";
  const patientPass = "Passw0rd!";
  const patientHash = await bcrypt.hash(patientPass, 10);

  await prisma.user.upsert({
    where: { email: patientEmail },
    update: {},
    create: {
      name: "Patient User",
      email: patientEmail,
      passwordHash: patientHash,
      role: "patient",
    },
  });

  // Create slots for next 7 days
  const now = new Date();
  for (let day = 0; day < 7; day++) {
    const date = new Date(now);
    date.setDate(now.getDate() + day);

    for (let hour = 9; hour < 17; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const startAt = new Date(date);
        startAt.setHours(hour, min, 0, 0);

        const endAt = new Date(startAt);
        endAt.setMinutes(startAt.getMinutes() + 30);

        await prisma.slot.create({
          data: {
            startAt,
            endAt,
            createdAt: new Date() // Ensure it's never null
          },
        });
      }
    }
  }

  console.log("Seeding done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
