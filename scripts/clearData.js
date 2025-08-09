import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing old data...");
  await prisma.booking.deleteMany();
  await prisma.slot.deleteMany();
  console.log("Data cleared!");
}

main()
  .catch(err => console.error(err))
  .finally(async () => {
    await prisma.$disconnect();
  });
