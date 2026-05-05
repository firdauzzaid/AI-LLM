import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log("Seeding database...");

  // Catatan: bcrypt akan kita pakai di tahap auth,
  // untuk seed pakai hash dummy dulu
  const dummyHash = crypto
    .createHash("sha256")
    .update("dummy-password")
    .digest("hex");

  const testUser = await prisma.user.upsert({
    where: { email: "[email protected]" },
    update: {},
    create: {
      email: "[email protected]",
      passwordHash: dummyHash, // akan diganti di tahap auth
    },
  });

  console.log(`Created test user: ${testUser.email} (${testUser.id})`);
  console.log("Seed completed");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
